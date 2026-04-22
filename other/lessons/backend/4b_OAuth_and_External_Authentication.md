# 4b. OAuth and External Authentication

Goal: understand where OAuth fits in this project, how it differs from password login, and how it connects to the existing JWT-based auth flow.

## Subject Context

According to `other/transcendance.md`:

- the mandatory part requires at least email/password authentication
- OAuth is an additional authentication method that can be implemented as a module

So OAuth does **not** replace the current login system. It extends it.

## Current Auth Flow In This Project

Right now the project already has a complete local auth flow:

- `POST /login` in `backend/src/routes/routes.js`
- `loginUser` in `backend/src/controllers/userController.js`
- JWT storage and user loading in `frontend/context/AuthContext.tsx`
- frontend API helpers in `frontend/lib/api.ts`

Current backend login route:

```js
router.post("/login", ctrl.loginUser);
```

Current login controller behavior:

```js
const user = await prisma.user.findFirst({
  where: {
    OR: [{ email: loginValue }, { username: loginValue }],
  },
});

const passwordOk = await bcrypt.compare(password, user.password);

const token = jwt.sign(
  { id: user.id, email: user.email },
  getEnv("JWT_SECRET"),
  { expiresIn: "3h" }
);
```

This means the app already knows how to:

- identify a user in the database
- verify credentials
- create its own JWT
- protect backend routes with `authMiddleware`

## What OAuth Changes

OAuth does **not** mean GitHub or 42 directly log the user into every protected route of our app.

Instead, OAuth means:

1. an external provider proves who the user is
2. our backend receives that proof
3. our backend then issues the app's normal JWT

So the final session system stays the same.

Mental model:

```text
provider authenticates user
backend trusts provider result
backend creates local JWT
frontend stores local JWT in AuthContext
protected routes continue to use Bearer token
```

## Why Backend-Driven OAuth Fits Best Here

This codebase already keeps auth responsibilities on the backend:

- the backend signs JWTs
- the backend verifies JWTs
- the frontend only stores the token and loads the current user

That makes backend-driven OAuth the cleanest option.

### Why not frontend-only OAuth?

Because:

- client secrets must stay private
- callback/token exchange logic is easier to secure on the backend
- it would fight the current architecture instead of reusing it

## How OAuth Fits Into The Existing Files

### Backend

Current routes:

- `GET /auth/github`
- `GET /auth/github/callback`
- `GET /auth/42`
- `GET /auth/42/callback`

Current controller responsibilities:

- redirect to the provider
- exchange the callback `code` for an access token
- fetch provider profile data
- find or create the local user
- sign the normal app JWT

Current files:

- `backend/src/routes/routes.js`
- `backend/src/controllers/oauthController.js`

### Frontend

The frontend should stay thin:

- login page button sends the user to the backend OAuth route
- frontend handoff page receives the backend-issued JWT
- `AuthContext.login(token)` stores the token and loads the user

This matches the current context code:

```tsx
const login = async (newToken: string) => {
  localStorage.setItem("token", newToken);
  setToken(newToken);
  setIsAuthLoading(true);

  const result = await getCurrentUser(newToken);
  ...
};
```

## What Data The Provider Gives vs What Our App Needs

An OAuth provider can give us external identity data, for example:

- provider user ID
- email
- username/login
- avatar

But our app still needs its own local user row in Prisma so the rest of the app can work normally.

That means OAuth logic usually does:

- find local user linked to provider ID
- or find local user by matching email
- or create a new local user

## GitHub OAuth In This Project

For GitHub, the implemented flow is:

1. redirect to GitHub authorize URL
2. get callback `code`
3. exchange `code` for GitHub access token
4. fetch profile + email
5. find or create local user
6. sign normal JWT
7. redirect frontend with that JWT

Important implementation details:

- GitHub may require fetching email separately
- only a verified email is accepted
- matching local email is auto-linked
- backend callback is `/auth/github/callback`
- frontend handoff page is `/auth/github/handoff`

## OAuth Network Reliability (April 2026)

During callback handling, provider requests can fail transiently in containerized environments (for example `UND_ERR_CONNECT_TIMEOUT` or `ECONNREFUSED`).

Current hardening in `backend/src/controllers/oauthController.js`:

- `fetchJson(...)` retries transient network failures and retryable statuses (429, 500, 502, 503, 504)
- GitHub API calls now send `User-Agent` and `X-GitHub-Api-Version` headers
- GitHub callback now fetches profile then emails sequentially (instead of `Promise.all`) to reduce concurrent outbound connections
- 42 profile fetch uses the same retry strategy

Real code excerpt:

```js
const OAUTH_READ_RETRY_ATTEMPTS = 3;
const OAUTH_READ_RETRY_BASE_DELAY_MS = 300;

const profile = await fetchGitHubProfile(accessToken);
const emails = await fetchGitHubEmails(accessToken);
```

Evaluator keywords: transient network failure, retry backoff, idempotent provider reads, callback resilience.

## 42 OAuth In This Project

For 42, the implemented flow is almost the same:

1. redirect to `https://api.intra.42.fr/oauth/authorize`
2. exchange callback `code` at `https://api.intra.42.fr/oauth/token`
3. fetch the current user from `https://api.intra.42.fr/v2/me`
4. find or create local user
5. sign normal JWT

Important implementation details:

- 42 uses the authorization-code flow documented by the 42 API guide
- the backend callback is `/auth/42/callback`
- the frontend handoff page is `/auth/42/handoff`
- matching local email is auto-linked
- the stable external identity stored in Prisma is `fortyTwoId`

Why 42 OAuth is especially relevant:

- it directly matches the school ecosystem
- the provider gives a strong school identity
- it can be easier to justify during evaluation because it clearly relates to 42

## Local User Linking Rules

Current rules:

- if provider email matches an existing local account, the provider is linked to that user
- if a provider-specific id already exists, that user is reused
- if the provider username/login conflicts with a local username, a suffix is added until it becomes unique
- if GitHub does not return a verified email, login fails
- if 42 does not return a usable email, login fails

## Environment Variables Likely Needed

For GitHub:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`

For 42:

- `FORTYTWO_CLIENT_ID`
- `FORTYTWO_CLIENT_SECRET`
- `FORTYTWO_CALLBACK_URL`

For the HTTPS evaluation stack:

- `FRONTEND_URL=https://localhost`
- `GITHUB_CALLBACK_URL=https://localhost/auth/github/callback`
- `FORTYTWO_CALLBACK_URL=https://localhost/auth/42/callback`

Those callback URLs must exactly match the provider configuration.

Recommended repo setup:

- `backend/.env` = dev OAuth clients
- `backend/.env.eval` = eval OAuth clients

That avoids constantly editing one provider app between:

- `http://localhost:3001/auth/github/callback`
- `https://localhost/auth/github/callback`

## HTTPS Eval Hardening

In the evaluation stack, OAuth requests pass through nginx on `https://localhost`.

Important backend hardening in `backend/src/controllers/oauthController.js`:

- state cookies are set with `httpOnly: true`
- `sameSite: "lax"` still allows the top-level provider redirect back into our callback route
- `secure: true` is enabled automatically when the callback URL uses HTTPS
- `clearCookie(...)` uses the same options so the browser actually removes the state cookie

Why this matters:

- the OAuth state cookie is our CSRF check between the start route and the callback route
- in eval, that cookie should only travel over HTTPS
- if `secure` or `path` do not match when clearing the cookie, stale state can remain in the browser

Related runtime detail:

- `backend/src/server.js` now sets `app.set("trust proxy", 1)`
- nginx forwards `X-Forwarded-Proto: https`
- that lets Express generate correct `https://...` URLs for uploaded media during the proxied eval flow

## Important Distinction To Remember

Do not confuse:

- provider token
- app token

The provider token is used only so the backend can talk to GitHub or 42.
The app token is the JWT created by our backend and used everywhere else in the project.

That separation keeps the rest of the application simple.

## Current Status In This Repository

OAuth is implemented for:

- GitHub
- 42

The project note is here:

- `other/todo_oauth.md`

That file contains:

- proposed GitHub flow
- 42 OAuth option
- likely files to touch
- unresolved design questions

## Self-Check Questions

- Why is OAuth an extension of auth here instead of a replacement?
- Why should the backend handle the provider callback?
- Why do we still issue our own JWT after OAuth succeeds?
- What is the difference between a provider access token and our app JWT?
- Which existing files already make backend-driven OAuth a good fit?
