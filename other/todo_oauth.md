# GitHub OAuth Notes

## Goal

Add GitHub OAuth to the current Express + Prisma + JWT auth system without replacing the existing email/password flow.

This should fit the current architecture:

- backend handles OAuth with GitHub
- backend issues the same app JWT used by the existing login flow
- frontend stores that JWT through `AuthContext`

## Why this approach

- It fits the current stack cleanly
- GitHub secrets stay on the backend
- It is easier to explain during evaluation than adding a larger auth framework
- The 42 subject allows OAuth as an additional auth method module

Reference:
- `other/transcendance.md`
- OAuth module note around the authentication section

## Recommended Flow

1. The frontend login page sends the user to `GET /auth/github`
2. The backend redirects the user to GitHub OAuth
3. GitHub redirects back to `GET /auth/github/callback?code=...`
4. The backend exchanges the `code` for a GitHub access token
5. The backend fetches:
   - the GitHub profile
   - the verified email list using `user:email`
6. The backend finds or creates the local user
7. The backend signs the normal app JWT
8. The backend redirects back to the frontend with the JWT
9. A frontend callback page stores the token with `AuthContext.login(...)`
10. The frontend redirects to `/feed`

## Why backend-driven OAuth is better here

- The backend already owns login logic and JWT creation
- The frontend already expects a JWT-based session
- It avoids exposing client secrets in the browser
- It keeps all auth-provider integration in one place

## Files likely to change

### Backend

- `backend/prisma/schema.prisma`
- `backend/src/routes/routes.js`
- `backend/src/controllers/userController.js`
  or a new controller such as:
- `backend/src/controllers/oauthController.js`
- `backend/.env.example`

### Frontend

- `frontend/app/login/page.tsx`
- `frontend/context/AuthContext.tsx`
- `frontend/lib/api.ts`
- `frontend/.env.local.example`
- a new callback route such as:
  - `frontend/app/auth/github/callback/page.tsx`

## Data model changes to consider

The user model will likely need provider information.

Possible additions:

- `githubId String? @unique`
- `authProvider String?`
- maybe sync `avatar` from GitHub if useful

The current project already has `username` and `email` unique, so GitHub account linking needs a clear rule.

## Account linking rule to decide

Important question:

If GitHub returns an email that already exists in the database, should the app:

- automatically link the GitHub account to that existing user
- or reject OAuth login and ask for manual linking

Recommended choice:

- automatically link if the GitHub email matches an existing local account

Why:

- it avoids duplicate users
- it is simpler for the user
- it keeps one identity per email

## Environment variables likely needed

### Backend

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`

### Frontend

- maybe `NEXT_PUBLIC_FRONTEND_URL` if redirect assembly is needed

## Backend responsibilities

The backend should:

- build the GitHub authorization URL
- exchange the callback `code` for an access token
- fetch GitHub profile data
- fetch verified email addresses
- select the correct email
- find or create the local user
- sign the normal JWT
- redirect to the frontend callback route with that token

## Frontend responsibilities

The frontend should:

- keep the GitHub button on the login page
- redirect to the backend OAuth start route
- handle the callback route
- read the token returned by the backend
- call `AuthContext.login(token)`
- redirect to `/feed`

## Why keep JWT after OAuth

Even after GitHub OAuth, the app should still issue its own JWT because:

- the rest of the app already uses JWT auth
- protected routes already expect `Authorization: Bearer <token>`
- this avoids rewriting the whole auth system

GitHub authenticates the user to the backend.
The backend then authenticates the user to the app.

## Alternative approaches

### 1. Passport / `passport-github2`

Pros:
- common pattern
- handles some OAuth plumbing

Cons:
- more framework magic
- harder to explain clearly during evaluation
- less consistent with the current simple auth flow

### 2. Frontend-driven OAuth

Pros:
- can work

Cons:
- worse fit for this project
- more moving pieces in the browser
- easier to get wrong
- harder to keep secrets and callback logic clean

## 42 OAuth Option

The project can also use the 42 school OAuth provider instead of, or in addition to, GitHub.

This follows the same backend-driven pattern:

1. Frontend sends the user to your backend route such as `/auth/42`
2. Backend redirects to `https://api.intra.42.fr/oauth/authorize`
3. 42 redirects back with a `code`
4. Backend exchanges that `code` for an access token at `https://api.intra.42.fr/oauth/token`
5. Backend fetches the current 42 user from `https://api.intra.42.fr/v2/me`
6. Backend finds or creates the local user
7. Backend signs the normal app JWT
8. Frontend stores the JWT with `AuthContext`

### Why 42 OAuth is interesting here

- It is directly relevant to the school context
- The `/v2/me` response includes a strong identity source from 42
- The provider gives a stable `id` and school login
- It may be easier to justify during evaluation because it clearly relates to the 42 ecosystem

### Likely data to store for a 42-authenticated user

- `intraId` or `fortyTwoId`
- `login` from 42
- `email`
- profile image URL if desired

### Additional env vars for 42 OAuth

- `FORTYTWO_CLIENT_ID`
- `FORTYTWO_CLIENT_SECRET`
- `FORTYTWO_CALLBACK_URL`

### Suggested local-user linking rule

If the 42 email matches an existing local account, linking it to that user is likely the cleanest behavior.

### Official references

- 42 API guides: `https://api.intra.42.fr/apidoc/guides`
- 42 web application flow: `https://api.intra.42.fr/apidoc/guides/web_application_flow`
- current user endpoint: `GET https://api.intra.42.fr/v2/me`

## Recommended implementation summary

Best fit for this repo:

- backend-driven GitHub OAuth
- local user find-or-create
- backend issues normal JWT
- frontend stores JWT through existing `AuthContext`

## Before implementation

Decide these points first:

1. Should matching GitHub email auto-link to an existing user?
2. What should happen if GitHub does not return a verified email?
3. Should OAuth-created users be forced to choose a username if the GitHub login name conflicts?
4. Do we want to store GitHub avatar data?
