# Eval Checklist

Purpose:
Track the implementation of the evaluation-ready Docker stack in a simple, explainable order.

Last updated: 2026-04-16

## Scope Guard

- Keep `docker-compose.dev.yml` as dev flow.
- Build eval flow in `docker-compose.yml`.
- Prioritize subject compliance and explainability over production hardening.
- Do not add advanced secrets orchestration yet.

## Current Status

- [ ] Phase 1: Runtime Docker setup (frontend + backend) for eval
- [ ] Phase 2: `docker-compose.yml` base stack (postgres/backend/frontend)
- [ ] Phase 3: Uploads named volume in eval (`uploads_data:/app/uploads`)
- [ ] Phase 4: HTTPS reverse proxy (`nginx`) + OAuth route split
- [ ] Phase 5: OAuth state cookie hardening for HTTPS (`Secure: true`)
- [ ] Phase 6: Makefile eval commands (`up`, `down`, `logs`, `re`) and dev aliases (`dev-up`, `dev-down`, `dev-logs`, `dev-re`)
- [ ] Phase 7: README + env examples documentation for evaluator flow

## Phase 1 — Runtime Docker Setup

- [ ] Add `backend/entrypoint.sh`:
  - `npx prisma migrate deploy`
  - `exec node src/server.js`
- [ ] Create eval backend Docker behavior (no `npm run dev`, no bind mount dependency).
- [ ] Create eval frontend Docker behavior:
  - build with `next build`
  - run with `next start`

Done when:
- backend and frontend can run from built images without source bind mounts.

## Phase 2 — Eval Compose Base

- [ ] Create `docker-compose.yml` with:
  - `postgres`
  - `backend`
  - `frontend`
- [ ] Remove source bind mounts in eval compose.
- [ ] Keep DB healthcheck + backend dependency + backend healthcheck.

Done when:
- `docker compose up --build` starts app stack in internal HTTP mode.

## Phase 3 — Upload Persistence

- [ ] Add named volume `uploads_data`.
- [ ] Mount `uploads_data:/app/uploads` on backend in eval compose.

Done when:
- uploaded files persist across container restarts and are no longer tied to repo bind mounts.

## Phase 4 — HTTPS Proxy + Routing

- [ ] Add `proxy` service (`nginx`) to eval compose.
- [ ] Expose `443` on proxy.
- [ ] Configure TLS cert/key for local eval usage.
- [ ] Route traffic:
  - frontend app pages -> `frontend`
  - backend API -> `backend`
  - `/auth/github/callback` -> `backend`
  - `/auth/42/callback` -> `backend`
  - `/auth/github/handoff` -> `frontend`
  - `/auth/42/handoff` -> `frontend`

Done when:
- app is reachable via HTTPS and OAuth callback/handoff paths hit the correct service.

## Phase 5 — OAuth Cookie Hardening

- [ ] Set OAuth state cookies with `secure: true` in HTTPS eval flow.
- [ ] Ensure clear-cookie uses matching secure/samesite/path options.

Done when:
- OAuth login works over HTTPS and state cookies are sent only via secure transport.

## Phase 6 — Makefile Eval Targets

- [ ] Add:
  - `make up`
  - `make down`
  - `make logs`
  - `make re`
  - `make dev-up`
  - `make dev-down`
  - `make dev-logs`
  - `make dev-re`

Done when:
- team can demo eval stack lifecycle with short, predictable commands.

## Phase 7 — Documentation

- [ ] Update `README.md` with clear split:
  - dev flow
  - eval flow
- [ ] Document HTTPS cert setup steps.
- [ ] Document required env vars and callback URL rules:
  - `GITHUB_CALLBACK_URL` must exactly match GitHub app config.
  - `FORTYTWO_CALLBACK_URL` must exactly match 42 app config.
  - `FRONTEND_URL` must be browser-reachable.
- [ ] Note migration requirement before OAuth testing.

Done when:
- evaluator can run the stack from docs without guessing missing steps.

## Final Validation Pass

- [ ] Fresh run from stopped state using eval commands only.
- [ ] HTTPS reachable on `443`.
- [ ] Backend healthcheck green.
- [ ] Prisma migrations applied on startup.
- [ ] OAuth callback + handoff paths verified.
- [ ] Upload persistence verified.
