# Eval Setup Plan

## Goal

Build an evaluation-ready Docker setup that:

- runs with one command
- does not rely on bind-mounted source code
- uses built images as the real runtime artifacts
- serves the app over HTTPS
- stays simple enough for the whole team to explain

This should be an evaluation-ready setup, not a full production platform.

## Recommended Structure

Keep:

- `docker-compose.yml` as the development setup

Add:

- `docker-compose.eval.yml`

This gives the project two clear flows:

- dev flow for daily work
- eval flow for final delivery and demonstration

## Eval Services

Recommended services:

- `postgres`
- `backend`
- `frontend`
- `proxy`

The proxy should handle HTTPS and forward traffic internally to the frontend and backend.

OAuth adds one requirement here:

- the public GitHub callback path must be forwarded to the backend service
- the frontend GitHub handoff page must stay on the frontend service
- the public 42 callback path must be forwarded to the backend service
- the frontend 42 handoff page must stay on the frontend service

## Main Differences From Dev Compose

The eval Compose setup should:

- remove source bind mounts like `./backend:/app` and `./frontend:/app`
- stop using dev servers like `npm run dev`
- stop relying on startup-time `npm install`
- use built images as the actual runtime
- keep runtime behavior reproducible and easier to explain

## Service Plan

### 1. Postgres

Keep:

- a named Docker volume for data persistence
- healthcheck
- env-based configuration

Possible future improvement:

- move sensitive values to Docker secrets

### 2. Backend

Eval behavior should be:

- no bind mount
- no hot reload
- stable runtime command

Suggested startup flow:

```sh
sh -c "npx prisma migrate deploy && node src/server.js"
```

For eval, replace the inline command chain with a proper entrypoint script (e.g. `backend/entrypoint.sh`):

- runs `prisma migrate deploy`
- then `exec`s into `node src/server.js`

Using `exec` ensures Node receives OS signals (SIGTERM, etc.) directly so Docker can stop the container gracefully. The Dockerfile should use `ENTRYPOINT` in JSON form:

```dockerfile
COPY entrypoint.sh /app/entrypoint.sh
ENTRYPOINT ["sh", "/app/entrypoint.sh"]
```

Keep:

- env validation
- DB health dependency
- backend healthcheck

Uploads should move to a named volume, for example:

- `uploads_data:/app/uploads`

This keeps runtime media out of the repo working tree.

### 3. Frontend

Eval behavior should be:

- no bind mount
- no Next dev server
- built app served with `next start`

Suggested Docker behavior:

- install dependencies
- build the app with `next build`
- start with `npm run start`

### 4. Proxy

Recommended role:

- expose `443`
- terminate TLS
- forward frontend traffic to the frontend service
- forward API traffic to the backend service

For GitHub OAuth, the route split now matters:

- backend OAuth callback: `/auth/github/callback`
- frontend handoff page: `/auth/github/handoff`

For 42 OAuth, the same split applies:

- backend OAuth callback: `/auth/42/callback`
- frontend handoff page: `/auth/42/handoff`

Two realistic options:

- `nginx`
- `caddy`

For team explainability, `nginx` is probably the easiest choice.

## HTTPS Strategy

The subject requires HTTPS for the backend.

A practical evaluation-friendly approach:

- use `nginx`
- generate local certificates
- keep cert files ignored by git
- document certificate setup clearly in the README

This is easier to explain than a more automated but less transparent setup.

## Upload Storage

Current dev behavior stores uploads in the repo tree through the bind mount.

For eval, uploads should move to a named Docker volume.

Recommended:

- backend writes to `/app/uploads`
- Compose mounts `uploads_data:/app/uploads`

Benefits:

- runtime data separated from source code
- persistent uploads
- cleaner repo

## Env And Secrets

For a first evaluation-ready version:

- keep `.env` and `.env.example`
- document them clearly

OAuth env vars that now matter:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `FORTYTWO_CLIENT_ID`
- `FORTYTWO_CLIENT_SECRET`
- `FORTYTWO_CALLBACK_URL`
- `FRONTEND_URL`

Important rule:

- `GITHUB_CALLBACK_URL`, `FORTYTWO_CALLBACK_URL`, and `FRONTEND_URL` must be browser-reachable public URLs
- do not use Docker service names like `backend` or `frontend` for these values
- only internal container-to-container traffic should use service names like `postgres`

Later improvement:

- move sensitive values like DB password and JWT secret to Docker secrets

So the recommended order is:

1. get the eval stack working with env files
2. upgrade secrets handling afterward if needed

## Dockerfiles

The eval setup will probably need different runtime behavior from dev.

Options:

### Option A: Separate Dockerfiles

Examples:

- `backend/Dockerfile.eval`
- `frontend/Dockerfile.eval`

Pros:

- very explicit
- easier to explain per environment

Cons:

- more duplication

### Option B: Multi-stage Dockerfiles

Pros:

- cleaner long-term
- less duplication

Cons:

- slightly more advanced to explain

For a 42 group project, separate eval Dockerfiles may actually be easier for the team.

## Makefile Additions

Recommended eval commands:

- `make eval-up`
- `make eval-down`
- `make eval-logs`
- `make eval-re`

This helps maintain the “single command” story for evaluation.

## Documentation

The README should clearly explain:

- dev flow
- eval flow
- env prerequisites
- HTTPS setup
- exact commands to run

For OAuth, documentation should also state:

- the deployed `GITHUB_CALLBACK_URL` must exactly match the callback URL configured in the GitHub OAuth app
- the deployed `FORTYTWO_CALLBACK_URL` must exactly match the callback URL configured in the 42 application
- OAuth login depends on database migrations being applied before testing

It should be obvious to an evaluator which command launches the evaluation-ready stack.

## Suggested Implementation Order

1. Add `docker-compose.eval.yml`
2. Remove bind mounts and dev commands in eval mode
3. Make frontend image work with `next build` and `next start`
4. Make backend use a stable runtime command
5. Move uploads to a named volume
6. Add reverse proxy with HTTPS
7. Add Makefile eval commands
8. Document the full eval flow in the README

## What Not To Overdo Yet

Do not overcomplicate the first eval setup with:

- advanced Docker secrets orchestration
- production-grade scaling concerns
- overly complex proxy logic
- unnecessary hardening beyond project needs

The target is:

- simple
- explainable
- reproducible
- compliant enough for evaluation

## Summary

Recommended final direction:

- keep current Compose as dev
- add a second Compose setup for eval
- remove source bind mounts in eval
- run real built artifacts in eval
- add HTTPS through a reverse proxy
- move uploads to a named volume
- document the flow clearly
