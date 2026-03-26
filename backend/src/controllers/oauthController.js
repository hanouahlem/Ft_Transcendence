import { randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import { assertEnv, getEnv } from "../env.js";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_API_BASE_URL = "https://api.github.com";
const GITHUB_SCOPES = ["read:user", "user:email"];
const OAUTH_STATE_COOKIE = "github_oauth_state";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

function redirectToFrontendCallback(res, payload) {
  const callbackUrl = new URL("/auth/github/handoff", getEnv("FRONTEND_URL"));

  if (payload.token) {
    callbackUrl.searchParams.set("token", payload.token);
  }

  if (payload.error) {
    callbackUrl.searchParams.set("error", payload.error);
  }

  return res.redirect(callbackUrl.toString());
}

function setOAuthStateCookie(res, state) {
  res.cookie(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: OAUTH_STATE_TTL_MS,
    path: "/auth/github",
  });
}

function clearOAuthStateCookie(res) {
  res.clearCookie(OAUTH_STATE_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/auth/github",
  });
}

function readCookie(req, name) {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [rawName, ...rawValue] = cookie.trim().split("=");

    if (rawName === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return null;
}

async function fetchJson(url, options, errorContext) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error_description ||
      data?.error ||
      data?.message ||
      errorContext;
    throw new Error(message);
  }

  return data;
}

async function exchangeCodeForAccessToken({ code, state }) {
  const body = new URLSearchParams({
    client_id: getEnv("GITHUB_CLIENT_ID"),
    client_secret: getEnv("GITHUB_CLIENT_SECRET"),
    code,
    redirect_uri: getEnv("GITHUB_CALLBACK_URL"),
    state,
  });

  const data = await fetchJson(
    GITHUB_ACCESS_TOKEN_URL,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
    "Failed to exchange GitHub code for access token.",
  );

  if (!data?.access_token) {
    throw new Error("GitHub did not return an access token.");
  }

  return data.access_token;
}

async function fetchGitHubProfile(accessToken) {
  return fetchJson(
    `${GITHUB_API_BASE_URL}/user`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
    "Failed to fetch GitHub profile.",
  );
}

async function fetchGitHubEmails(accessToken) {
  return fetchJson(
    `${GITHUB_API_BASE_URL}/user/emails`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
    "Failed to fetch GitHub emails.",
  );
}

function selectVerifiedEmail(emails) {
  if (!Array.isArray(emails)) {
    return null;
  }

  const primaryVerifiedEmail = emails.find(
    (email) => email?.verified && email?.primary && typeof email.email === "string",
  );

  if (primaryVerifiedEmail) {
    return primaryVerifiedEmail.email;
  }

  const fallbackVerifiedEmail = emails.find(
    (email) => email?.verified && typeof email.email === "string",
  );

  return fallbackVerifiedEmail?.email ?? null;
}

async function buildUniqueUsername(candidate) {
  const trimmedCandidate = candidate.trim();
  let suffix = 0;

  while (true) {
    const username = suffix === 0 ? trimmedCandidate : `${trimmedCandidate}_${suffix}`;
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!existingUser) {
      return username;
    }

    suffix += 1;
  }
}

async function findOrCreateOAuthUser(profile, email) {
  if (typeof profile?.id !== "number" && typeof profile?.id !== "string") {
    throw new Error("GitHub did not return a valid user id.");
  }

  const githubId = String(profile.id);
  const userByGitHubId = await prisma.user.findUnique({
    where: { githubId },
  });

  if (userByGitHubId) {
    return userByGitHubId;
  }

  const userByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (userByEmail) {
    if (userByEmail.githubId && userByEmail.githubId !== githubId) {
      throw new Error("This email is already linked to a different GitHub account.");
    }

    return prisma.user.update({
      where: { id: userByEmail.id },
      data: { githubId },
    });
  }

  const baseUsername =
    typeof profile.login === "string" && profile.login.trim()
      ? profile.login.trim()
      : email.split("@")[0];

  const username = await buildUniqueUsername(baseUsername);

  return prisma.user.create({
    data: {
      username,
      email,
      password: null,
      githubId,
      avatar: typeof profile.avatar_url === "string" ? profile.avatar_url : null,
    },
  });
}

function signAppToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    getEnv("JWT_SECRET"),
    { expiresIn: "3h" },
  );
}

export function startGitHubOAuth(_req, res) {
  try {
    assertEnv([
      "GITHUB_CLIENT_ID",
      "GITHUB_CLIENT_SECRET",
      "GITHUB_CALLBACK_URL",
      "FRONTEND_URL",
    ]);
    const state = randomBytes(32).toString("hex");

    const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
    authorizeUrl.searchParams.set("client_id", getEnv("GITHUB_CLIENT_ID"));
    authorizeUrl.searchParams.set("redirect_uri", getEnv("GITHUB_CALLBACK_URL"));
    authorizeUrl.searchParams.set("scope", GITHUB_SCOPES.join(" "));
    authorizeUrl.searchParams.set("state", state);

    setOAuthStateCookie(res, state);

    return res.redirect(authorizeUrl.toString());
  } catch (error) {
    console.error("startGitHubOAuth error:", error);
    return res.status(500).json({
      message: "GitHub OAuth is not configured correctly.",
    });
  }
}

export async function handleGitHubCallback(req, res) {
  try {
    assertEnv([
      "GITHUB_CLIENT_ID",
      "GITHUB_CLIENT_SECRET",
      "GITHUB_CALLBACK_URL",
      "FRONTEND_URL",
      "JWT_SECRET",
    ]);

    const { code, state, error, error_description: errorDescription } = req.query;

    if (typeof error === "string" && error.trim()) {
      clearOAuthStateCookie(res);
      return redirectToFrontendCallback(res, {
        error:
          typeof errorDescription === "string" && errorDescription.trim()
            ? errorDescription
            : error,
      });
    }

    if (typeof code !== "string" || !code.trim()) {
      clearOAuthStateCookie(res);
      return redirectToFrontendCallback(res, {
        error: "GitHub did not return a valid authorization code.",
      });
    }

    const expectedState = readCookie(req, OAUTH_STATE_COOKIE);

    if (
      typeof state !== "string" ||
      !state.trim() ||
      !expectedState ||
      state !== expectedState
    ) {
      clearOAuthStateCookie(res);
      return redirectToFrontendCallback(res, {
        error: "Invalid OAuth state. Please try again.",
      });
    }

    const accessToken = await exchangeCodeForAccessToken({
      code: code.trim(),
      state: state.trim(),
    });
    const [profile, emails] = await Promise.all([
      fetchGitHubProfile(accessToken),
      fetchGitHubEmails(accessToken),
    ]);
    const verifiedEmail = selectVerifiedEmail(emails);

    if (!verifiedEmail) {
      clearOAuthStateCookie(res);
      return redirectToFrontendCallback(res, {
        error: "GitHub did not return a verified email address.",
      });
    }

    const user = await findOrCreateOAuthUser(profile, verifiedEmail);
    const token = signAppToken(user);

    clearOAuthStateCookie(res);
    return redirectToFrontendCallback(res, { token });
  } catch (error) {
    console.error("handleGitHubCallback error:", error);

    clearOAuthStateCookie(res);

    try {
      assertEnv(["FRONTEND_URL"]);
      return redirectToFrontendCallback(res, {
        error: error instanceof Error ? error.message : "GitHub OAuth failed.",
      });
    } catch (envError) {
      console.error("GitHub OAuth frontend redirect error:", envError);
      return res.status(500).json({
        message: "GitHub OAuth failed and frontend redirect is not configured.",
      });
    }
  }
}

export default {
  startGitHubOAuth,
  handleGitHubCallback,
};
