import { randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import { assertEnv, getEnv } from "../env.js";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_API_BASE_URL = "https://api.github.com";
const GITHUB_SCOPES = ["read:user", "user:email"];

const FORTYTWO_AUTHORIZE_URL = "https://api.intra.42.fr/oauth/authorize";
const FORTYTWO_ACCESS_TOKEN_URL = "https://api.intra.42.fr/oauth/token";
const FORTYTWO_ME_URL = "https://api.intra.42.fr/v2/me";
const FORTYTWO_SCOPES = ["public"];

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const OAUTH_READ_RETRY_ATTEMPTS = 3;
const OAUTH_READ_RETRY_BASE_DELAY_MS = 300;
const RETRYABLE_FETCH_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ENOTFOUND",
  "ENETUNREACH",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);
const RETRYABLE_HTTP_STATUSES = new Set([429, 500, 502, 503, 504]);

const PROVIDERS = {
  github: {
    callbackEnvKey: "GITHUB_CALLBACK_URL",
    handoffPath: "/auth/github/handoff",
    startPath: "/auth/github",
    stateCookie: "github_oauth_state",
    displayName: "GitHub",
  },
  fortyTwo: {
    callbackEnvKey: "FORTYTWO_CALLBACK_URL",
    handoffPath: "/auth/42/handoff",
    startPath: "/auth/42",
    stateCookie: "fortytwo_oauth_state",
    displayName: "42",
  },
};

function redirectToFrontendHandoff(res, provider, payload) {
  const handoffUrl = new URL(provider.handoffPath, getEnv("FRONTEND_URL"));

  if (payload.token) {
    handoffUrl.searchParams.set("token", payload.token);
  }

  if (payload.error) {
    handoffUrl.searchParams.set("error", payload.error);
  }

  return res.redirect(handoffUrl.toString());
}

function setOAuthStateCookie(res, provider, state) {
  const secure = shouldUseSecureOAuthCookie(provider);

  res.cookie(provider.stateCookie, state, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: OAUTH_STATE_TTL_MS,
    path: provider.startPath,
  });
}

function clearOAuthStateCookie(res, provider) {
  const secure = shouldUseSecureOAuthCookie(provider);

  res.clearCookie(provider.stateCookie, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: provider.startPath,
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

function sleep(ms) {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function shouldUseSecureOAuthCookie(provider) {
  const callbackUrl = getEnv(provider.callbackEnvKey);
  return callbackUrl.startsWith("https://");
}

function getFetchErrorCode(error) {
  if (error && typeof error === "object") {
    return (
      error.code ||
      error.cause?.code ||
      error.cause?.cause?.code ||
      ""
    );
  }

  return "";
}

function isRetryableFetchError(error) {
  const code = getFetchErrorCode(error);
  return RETRYABLE_FETCH_ERROR_CODES.has(code);
}

function buildFetchErrorMessage(errorContext, error) {
  const code = getFetchErrorCode(error);
  const detail =
    error?.cause?.message ||
    error?.message ||
    "";

  if (code && detail) {
    return `${errorContext} (${code}: ${detail})`;
  }

  if (code) {
    return `${errorContext} (${code})`;
  }

  if (detail) {
    return `${errorContext} (${detail})`;
  }

  return errorContext;
}

async function fetchJson(url, options, errorContext, retryOptions = {}) {
  const attempts = Number.isInteger(retryOptions.attempts)
    ? Math.max(1, retryOptions.attempts)
    : 1;
  const baseDelayMs =
    typeof retryOptions.baseDelayMs === "number"
      ? Math.max(0, retryOptions.baseDelayMs)
      : 0;
  const shouldRetryHttpStatus =
    typeof retryOptions.shouldRetryHttpStatus === "function"
      ? retryOptions.shouldRetryHttpStatus
      : (status) => RETRYABLE_HTTP_STATUSES.has(status);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response;

    try {
      response = await fetch(url, options);
    } catch (error) {
      if (attempt < attempts && isRetryableFetchError(error)) {
        await sleep(baseDelayMs * attempt);
        continue;
      }

      throw new Error(buildFetchErrorMessage(errorContext, error), { cause: error });
    }

    const data = await response.json().catch(() => null);

    if (response.ok === false) {
      if (attempt < attempts && shouldRetryHttpStatus(response.status)) {
        await sleep(baseDelayMs * attempt);
        continue;
      }

      const message =
        data?.error_description ||
        data?.error ||
        data?.message ||
        errorContext;
      throw new Error(message);
    }

    return data;
  }

  throw new Error(errorContext);
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

function signAppToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    getEnv("JWT_SECRET"),
    { expiresIn: "3h" },
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

async function exchangeGitHubCodeForAccessToken({ code, state }) {
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
        "User-Agent": "ft-transcendence-oauth",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
    "Failed to fetch GitHub profile.",
    {
      attempts: OAUTH_READ_RETRY_ATTEMPTS,
      baseDelayMs: OAUTH_READ_RETRY_BASE_DELAY_MS,
    },
  );
}

async function fetchGitHubEmails(accessToken) {
  return fetchJson(
    `${GITHUB_API_BASE_URL}/user/emails`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "ft-transcendence-oauth",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
    "Failed to fetch GitHub emails.",
    {
      attempts: OAUTH_READ_RETRY_ATTEMPTS,
      baseDelayMs: OAUTH_READ_RETRY_BASE_DELAY_MS,
    },
  );
}

async function findOrCreateGitHubUser(profile, email) {
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

async function exchangeFortyTwoCodeForAccessToken({ code }) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: getEnv("FORTYTWO_CLIENT_ID"),
    client_secret: getEnv("FORTYTWO_CLIENT_SECRET"),
    code,
    redirect_uri: getEnv("FORTYTWO_CALLBACK_URL"),
  });

  const data = await fetchJson(
    FORTYTWO_ACCESS_TOKEN_URL,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
    "Failed to exchange 42 code for access token.",
  );

  if (!data?.access_token) {
    throw new Error("42 did not return an access token.");
  }

  return data.access_token;
}

async function fetchFortyTwoProfile(accessToken) {
  return fetchJson(
    FORTYTWO_ME_URL,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
    "Failed to fetch 42 profile.",
    {
      attempts: OAUTH_READ_RETRY_ATTEMPTS,
      baseDelayMs: OAUTH_READ_RETRY_BASE_DELAY_MS,
    },
  );
}

function getFortyTwoAvatarUrl(profile) {
  if (typeof profile?.image?.link === "string" && profile.image.link.trim()) {
    return profile.image.link.trim();
  }

  return null;
}

async function findOrCreateFortyTwoUser(profile) {
  if (typeof profile?.id !== "number" && typeof profile?.id !== "string") {
    throw new Error("42 did not return a valid user id.");
  }

  if (typeof profile?.email !== "string" || !profile.email.trim()) {
    throw new Error("42 did not return a usable email address.");
  }

  const fortyTwoId = String(profile.id);
  const email = profile.email.trim();
  const userByFortyTwoId = await prisma.user.findUnique({
    where: { fortyTwoId },
  });

  if (userByFortyTwoId) {
    return userByFortyTwoId;
  }

  const userByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (userByEmail) {
    if (userByEmail.fortyTwoId && userByEmail.fortyTwoId !== fortyTwoId) {
      throw new Error("This email is already linked to a different 42 account.");
    }

    return prisma.user.update({
      where: { id: userByEmail.id },
      data: { fortyTwoId },
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
      fortyTwoId,
      avatar: getFortyTwoAvatarUrl(profile),
    },
  });
}

function validateOAuthState(req, provider, state) {
  const expectedState = readCookie(req, provider.stateCookie);

  return (
    typeof state === "string" &&
    state.trim() &&
    expectedState &&
    state === expectedState
  );
}

function handleProviderStartError(res, provider, error) {
  console.error(`start${provider.displayName}OAuth error:`, error);
  return res.status(500).json({
    message: `${provider.displayName} OAuth is not configured correctly.`,
  });
}

function handleProviderCallbackError(res, provider, error, fallbackMessage) {
  console.error(`handle${provider.displayName}Callback error:`, error);
  clearOAuthStateCookie(res, provider);

  try {
    assertEnv(["FRONTEND_URL"]);
    return redirectToFrontendHandoff(res, provider, {
      error: error instanceof Error ? error.message : fallbackMessage,
    });
  } catch (envError) {
    console.error(`${provider.displayName} OAuth frontend redirect error:`, envError);
    return res.status(500).json({
      message: `${provider.displayName} OAuth failed and frontend redirect is not configured.`,
    });
  }
}

export function startGitHubOAuth(_req, res) {
  const provider = PROVIDERS.github;

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

    setOAuthStateCookie(res, provider, state);

    return res.redirect(authorizeUrl.toString());
  } catch (error) {
    return handleProviderStartError(res, provider, error);
  }
}

export async function handleGitHubCallback(req, res) {
  const provider = PROVIDERS.github;

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
      clearOAuthStateCookie(res, provider);
      return redirectToFrontendHandoff(res, provider, {
        error:
          typeof errorDescription === "string" && errorDescription.trim()
            ? errorDescription
            : error,
      });
    }

    if (typeof code !== "string" || !code.trim()) {
      clearOAuthStateCookie(res, provider);
      return redirectToFrontendHandoff(res, provider, {
        error: "GitHub did not return a valid authorization code.",
      });
    }

    if (!validateOAuthState(req, provider, state)) {
      clearOAuthStateCookie(res, provider);
      return redirectToFrontendHandoff(res, provider, {
        error: "Invalid OAuth state. Please try again.",
      });
    }

    const accessToken = await exchangeGitHubCodeForAccessToken({
      code: code.trim(),
      state: state.trim(),
    });
    const profile = await fetchGitHubProfile(accessToken);
    const emails = await fetchGitHubEmails(accessToken);
    const verifiedEmail = selectVerifiedEmail(emails);

    if (!verifiedEmail) {
      clearOAuthStateCookie(res, provider);
      return redirectToFrontendHandoff(res, provider, {
        error: "GitHub did not return a verified email address.",
      });
    }

    const user = await findOrCreateGitHubUser(profile, verifiedEmail);
    const token = signAppToken(user);

    clearOAuthStateCookie(res, provider);
    return redirectToFrontendHandoff(res, provider, { token });
  } catch (error) {
    return handleProviderCallbackError(res, provider, error, "GitHub OAuth failed.");
  }
}

export function startFortyTwoOAuth(_req, res) {
  const provider = PROVIDERS.fortyTwo;

  try {
    assertEnv([
      "FORTYTWO_CLIENT_ID",
      "FORTYTWO_CLIENT_SECRET",
      "FORTYTWO_CALLBACK_URL",
      "FRONTEND_URL",
    ]);

    const state = randomBytes(32).toString("hex");
    const authorizeUrl = new URL(FORTYTWO_AUTHORIZE_URL);
    authorizeUrl.searchParams.set("client_id", getEnv("FORTYTWO_CLIENT_ID"));
    authorizeUrl.searchParams.set("redirect_uri", getEnv("FORTYTWO_CALLBACK_URL"));
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", FORTYTWO_SCOPES.join(" "));
    authorizeUrl.searchParams.set("state", state);

    setOAuthStateCookie(res, provider, state);

    return res.redirect(authorizeUrl.toString());
  } catch (error) {
    return handleProviderStartError(res, provider, error);
  }
}

export async function handleFortyTwoCallback(req, res) {
  const provider = PROVIDERS.fortyTwo;

  try {
    assertEnv([
      "FORTYTWO_CLIENT_ID",
      "FORTYTWO_CLIENT_SECRET",
      "FORTYTWO_CALLBACK_URL",
      "FRONTEND_URL",
      "JWT_SECRET",
    ]);

    const { code, state, error, error_description: errorDescription } = req.query;

    if (typeof error === "string" && error.trim()) {
      clearOAuthStateCookie(res, provider);
      return redirectToFrontendHandoff(res, provider, {
        error:
          typeof errorDescription === "string" && errorDescription.trim()
            ? errorDescription
            : error,
      });
    }

    if (typeof code !== "string" || !code.trim()) {
      clearOAuthStateCookie(res, provider);
      return redirectToFrontendHandoff(res, provider, {
        error: "42 did not return a valid authorization code.",
      });
    }

    if (!validateOAuthState(req, provider, state)) {
      clearOAuthStateCookie(res, provider);
      return redirectToFrontendHandoff(res, provider, {
        error: "Invalid OAuth state. Please try again.",
      });
    }

    const accessToken = await exchangeFortyTwoCodeForAccessToken({
      code: code.trim(),
    });
    const profile = await fetchFortyTwoProfile(accessToken);
    const user = await findOrCreateFortyTwoUser(profile);
    const token = signAppToken(user);

    clearOAuthStateCookie(res, provider);
    return redirectToFrontendHandoff(res, provider, { token });
  } catch (error) {
    return handleProviderCallbackError(res, provider, error, "42 OAuth failed.");
  }
}

export default {
  startGitHubOAuth,
  handleGitHubCallback,
  startFortyTwoOAuth,
  handleFortyTwoCallback,
};
