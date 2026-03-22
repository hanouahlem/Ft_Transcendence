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
