# 7. Eval Stack, HTTPS, and OAuth Routing

## What this does

This lesson explains the evaluation-only stack added beside the dev stack:

- [`docker-compose.eval.yml`](/Users/curtis/Desktop/DEV/main_transcendance/docker-compose.eval.yml)
- [`backend/entrypoint.sh`](/Users/curtis/Desktop/DEV/main_transcendance/backend/entrypoint.sh)
- [`other/nginx/eval.conf`](/Users/curtis/Desktop/DEV/main_transcendance/other/nginx/eval.conf)
- `backend/.env.eval` (local ignored file copied from `backend/.env.eval.example`)

The goal is to satisfy the subject rule in [`other/transcendance.md`](/Users/curtis/Desktop/DEV/main_transcendance/other/transcendance.md) that deployment must use containerization and run with a single command, while keeping the existing bind-mounted dev workflow unchanged.

## Why we split dev and eval

`docker-compose.yml` is a development stack:

- source code is bind-mounted
- backend runs `npm run dev`
- frontend runs `next dev`

`docker-compose.eval.yml` is an evaluation stack:

- no source bind mounts
- backend uses a built runtime image
- frontend uses `next build` then `next start`
- nginx terminates HTTPS on port `443`
- uploads persist in a named Docker volume instead of the repo tree

This separation keeps the project easier to explain:

- dev flow = fast iteration
- eval flow = containerized runtime closer to the subject requirement

## Backend runtime image

The backend Dockerfile now has separate stages in [`backend/Dockerfile`](/Users/curtis/Desktop/DEV/main_transcendance/backend/Dockerfile):

```Dockerfile
FROM base AS dev
CMD ["npm", "run", "dev"]

FROM base AS runtime
CMD ["/app/entrypoint.sh"]
```

The eval entrypoint is [`backend/entrypoint.sh`](/Users/curtis/Desktop/DEV/main_transcendance/backend/entrypoint.sh):

```sh
mkdir -p /app/uploads
npx prisma migrate deploy
exec node src/server.js
```

Why this matters:

- `prisma migrate deploy` applies tracked migrations automatically at startup
- `node src/server.js` starts plain Express, not Nodemon
- runtime data stays inside container volumes, not bind mounts

Evaluator keywords: runtime image, immutable container, startup migration, bind mount vs named volume.

## Frontend runtime image

The frontend Dockerfile now also has `dev` and `runtime` stages in [`frontend/Dockerfile`](/Users/curtis/Desktop/DEV/main_transcendance/frontend/Dockerfile).

The runtime stage:

- receives `NEXT_PUBLIC_API_URL` at build time
- runs `next build`
- starts with `npm run start`

In eval we build it with:

```yml
args:
  NEXT_PUBLIC_API_URL: https://localhost/api
```

That means browser requests go through nginx over HTTPS instead of trying to call `http://localhost:3001`, which Chrome would block as mixed content.

The eval compose file also injects backend HTTPS values:

Those values now live in `backend/.env.eval`, not in the dev `backend/.env` file:

- `FRONTEND_URL=https://localhost`
- `GITHUB_CALLBACK_URL=https://localhost/auth/github/callback`
- `FORTYTWO_CALLBACK_URL=https://localhost/auth/42/callback`

So the project now uses two backend env files:

- `backend/.env` for dev OAuth clients and `http://localhost:3000/3001`
- `backend/.env.eval` for eval OAuth clients and `https://localhost`

## Nginx route split

The proxy lives in [`other/nginx/eval.conf`](/Users/curtis/Desktop/DEV/main_transcendance/other/nginx/eval.conf).

Important routes:

- `/api/...` -> backend, with `/api/` stripped before forwarding
- `/uploads/...` -> backend static files
- `/socket.io/...` -> backend WebSocket upgrade
- `/auth/github/callback` and `/auth/42/callback` -> backend
- `/auth/github/handoff` and `/auth/42/handoff` -> frontend
- everything else -> frontend

Why the split exists:

- provider callbacks must hit the backend because the backend exchanges the OAuth `code` for provider tokens
- handoff pages must hit the frontend because they store the app JWT in local auth state and redirect the user into the UI

This matches the current backend routes in [`backend/src/routes/routes.js`](/Users/curtis/Desktop/DEV/main_transcendance/backend/src/routes/routes.js) and the frontend handoff pages in:

- [`frontend/app/(auth)/auth/github/handoff/page.tsx`](/Users/curtis/Desktop/DEV/main_transcendance/frontend/app/(auth)/auth/github/handoff/page.tsx)
- [`frontend/app/(auth)/auth/42/handoff/page.tsx`](/Users/curtis/Desktop/DEV/main_transcendance/frontend/app/(auth)/auth/42/handoff/page.tsx)

## Secure OAuth cookies under HTTPS

OAuth state cookies are set in [`backend/src/controllers/oauthController.js`](/Users/curtis/Desktop/DEV/main_transcendance/backend/src/controllers/oauthController.js).

The important change is that the cookie now becomes `secure: true` when the callback URL is HTTPS, or when `OAUTH_COOKIE_SECURE=true` is set explicitly.

Why:

- in eval, the browser reaches the backend callback through `https://localhost/...`
- state cookies should only travel on HTTPS in that flow
- `clearCookie` must use the same `secure`, `sameSite`, and `path` options or the browser may keep the cookie

Evaluator keywords: OAuth state, CSRF protection, secure cookie, same-site, callback URL exact match.

## Why Express trusts the proxy

The backend now sets:

```js
app.set("trust proxy", 1);
```

in [`backend/src/server.js`](/Users/curtis/Desktop/DEV/main_transcendance/backend/src/server.js).

Why:

- nginx sends `X-Forwarded-Proto: https`
- Express must trust that header to treat the original browser request as HTTPS
- uploaded media URLs are built from `req.protocol` and `req.get("host")`

Without `trust proxy`, uploaded media could be returned as `http://localhost/uploads/...`, which would break inside an HTTPS page.

## Upload persistence in eval

In [`docker-compose.eval.yml`](/Users/curtis/Desktop/DEV/main_transcendance/docker-compose.eval.yml) the backend mounts:

```yml
volumes:
  - uploads_data:/app/uploads
```

That means:

- uploads survive container restarts
- uploads are no longer written into `backend/uploads` on the host repo
- source code and runtime files stay separated

## Commands to know

- `make up`: build and start the eval stack
- `make down`: stop eval containers without deleting named volumes
- `make logs`: inspect eval logs
- `make re`: rebuild and restart the eval stack from a clean state
- `make dev` or `make dev-up`: start the bind-mounted development stack

## Check questions

- Why do we keep `docker-compose.yml` and `docker-compose.eval.yml` separate?
- Why must OAuth callback routes go to the backend but handoff routes go to the frontend?
- Why would `http://localhost:3001` be wrong for the frontend API in HTTPS eval mode?
- Why do we need both secure cookies and `trust proxy` in the eval flow?
- Why is `uploads_data` a named volume instead of a bind mount?
