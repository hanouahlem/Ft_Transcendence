# 8. Dev Workflow and Failure Modes

Goal: understand how to run the backend confidently and what commonly breaks.

## Current Dev Workflow

This project uses a dev-oriented Docker Compose setup.

Important traits:

- backend source is bind-mounted
- frontend source is bind-mounted
- backend runs `npm run dev`
- frontend runs a dev server
- Postgres data is persisted with a named Docker volume

So the stack is optimized for iteration, not for production-style immutability.

## Backend Startup In Docker

The backend startup command in `docker-compose.yml` does this:

1. builds Docker-side `DATABASE_URL`
2. runs `prisma generate`
3. runs `prisma migrate deploy`
4. runs `npm run dev`

Why:

- Docker needs host `postgres` instead of `localhost`
- Prisma client should match the current schema
- DB schema should be up to date
- dev server should hot reload code changes

## Env Validation

Before Express starts, `backend/src/env.js` validates required env vars.

Current required backend vars:

- `DATABASE_URL`
- `JWT_SECRET`

If one is missing:

- startup fails early with a clear error

That is better than failing later in a random controller.

## Healthchecks

Postgres healthcheck:

- uses `pg_isready`

Backend healthcheck:

- uses `GET /health`

This matters because:

- backend should wait for DB readiness
- frontend should wait for backend readiness

So Docker is checking service readiness, not just process startup.

## Running Outside Docker

You can also run the backend locally with:

```bash
cd backend && npm run dev
```

In that case:

- `DATABASE_URL` must point to local Postgres access
- backend still needs `JWT_SECRET`

## Common Failure Modes

### Missing env variable

Symptoms:

- startup error mentioning missing `DATABASE_URL` or `JWT_SECRET`

Cause:

- `backend/.env` missing or incomplete

### Database unreachable

Symptoms:

- Prisma connection errors
- migrations fail

Cause:

- Postgres not running
- wrong `DATABASE_URL`
- wrong Docker host in connection string

### Invalid JWT

Symptoms:

- protected route returns `401`

Cause:

- missing token
- malformed `Authorization` header
- expired or invalid token

### Bad request data

Symptoms:

- `400` responses

Cause:

- missing required fields
- invalid IDs
- invalid upload shape

### Upload errors

Symptoms:

- post creation fails when file is not an image

Cause:

- Multer rejects non-image files

### Seeded comments bypass moderation

Symptoms:

- `make seed` needs to create comments even when the normal moderation path is enabled

How it works:

- backend reads optional `SEED_SCRIPT_KEY` through [`backend/src/env.js`](/Users/curtis/Desktop/DEV/last_jeune/backend/src/env.js)
- the generator wrapper [`other/superseed.sh`](/Users/curtis/Desktop/DEV/last_jeune/other/superseed.sh) reads the same value from `backend/.env` and passes it to [`other/seed/seed.mjs`](/Users/curtis/Desktop/DEV/last_jeune/other/seed/seed.mjs)
- seeded comment requests send `x-seed-script-key`
- [`backend/src/controllers/postController.js`](/Users/curtis/Desktop/DEV/last_jeune/backend/src/controllers/postController.js) only sets `skipModeration` when the header matches the env value
- [`backend/src/services/postService.js`](/Users/curtis/Desktop/DEV/last_jeune/backend/src/services/postService.js) skips `checkComment()` only for that local seed path

Why this matters:

- `commentChecker.js` stays untouched, which is better for teammate ownership
- the bypass only applies to seeded comments created by the local generator
- ordinary user comments still use the normal moderation path

## Current Seed Flow

The large social dataset is no longer embedded directly in the shell script.

Current flow:

- [`other/seed.sh`](/Users/curtis/Desktop/DEV/last_jeune/other/seed.sh) remains the older small scripted seed
- [`other/superseed.sh`](/Users/curtis/Desktop/DEV/last_jeune/other/superseed.sh) is the thin launcher for the large deterministic dataset
- [`other/seed/seed.mjs`](/Users/curtis/Desktop/DEV/last_jeune/other/seed/seed.mjs) loads curated JSON config from [`other/seed/config/roster.json`](/Users/curtis/Desktop/DEV/last_jeune/other/seed/config/roster.json), [`other/seed/config/clusters.json`](/Users/curtis/Desktop/DEV/last_jeune/other/seed/config/clusters.json), [`other/seed/config/themes.json`](/Users/curtis/Desktop/DEV/last_jeune/other/seed/config/themes.json), [`other/seed/config/relationships.json`](/Users/curtis/Desktop/DEV/last_jeune/other/seed/config/relationships.json), and [`other/seed/config/showcase-users.json`](/Users/curtis/Desktop/DEV/last_jeune/other/seed/config/showcase-users.json)
- the generator builds deterministic user budgets, friendship plans, post plans, likes, favorites, and comment plans from that small curated input
- all real data creation still happens through the existing HTTP routes: register, login, profile update, friends, posts, likes, favorites, comments

Why this version is easier to explain in evaluation:

- the larger seed keeps shell responsibilities small and obvious
- the backend remains the source of truth because the seed still uses the public route layer
- the dataset is scalable without pasting hundreds of hardcoded posts into Bash
- `node other/seed/seed.mjs --plan-only` gives a non-mutating shape check before touching the database

## What To Check First When Something Breaks

1. Is Docker Compose up?
2. Is Postgres healthy?
3. Is backend healthy on `/health`?
4. Is `backend/.env` correct?
5. Is the request authenticated if the route is protected?
6. Is the request body/params valid?

## Mental Model To Remember

Backend issues usually come from one of four areas:

- startup/config
- database connectivity
- auth
- input validation

If you identify which area failed first, debugging gets much easier.

## Self-Check Questions

- Why does Docker backend use `postgres` instead of `localhost`?
- What is the purpose of `validateEnv()`?
- What problem does `/health` solve?
- If a protected route returns `401`, what are the first two things you should check?
- Why does the seed workflow use `SEED_SCRIPT_KEY` instead of modifying `commentChecker.js`?
