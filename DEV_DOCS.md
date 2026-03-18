# Dev Docs

## Environment Setup

This project now uses `backend/.env` as the local development source of truth for backend variables.

The file contains:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/transcendence
JWT_SECRET=dev-secret-change-me
```

The tracked template is `.env.example` and matches the same values, plus the optional frontend API variable:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/transcendence
JWT_SECRET=dev-secret-change-me
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## What Each Variable Does

- `DATABASE_URL`
  - Used by the backend Prisma client at `backend/src/prisma.js`
  - Used by Prisma config at `backend/prisma.config.ts`
  - Local host value uses `localhost:5432`

- `JWT_SECRET`
  - Used by login token creation in `backend/src/controllers/userController.js`
  - Used by protected-route token verification in `backend/src/middleware/auth.js`

- `PORT`
  - Used by the Express server in `backend/src/server.js`
  - Defaults to `3001` in the app
  - Docker Compose sets it explicitly for the backend container

- `NEXT_PUBLIC_API_URL`
  - Used by the frontend API client in `frontend/lib/api.ts`
  - Optional because the frontend already falls back to `http://localhost:3001`

## Local Run Modes

### 1. Run with Docker Compose

Use:

```bash
docker compose up
```

How it works:

- `postgres` runs on port `5432`
- `backend` loads `backend/.env`
- `backend` overrides only `DATABASE_URL` inside Docker so it can reach the database container with host `postgres`
- `backend` sets `PORT=3001` in Compose
- `frontend` runs on port `3000`

Important detail:

- The value in `backend/.env` uses `localhost` because it is meant to work when you run the backend directly on your machine
- Inside Docker, `docker-compose.yml` replaces that one variable with:

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/transcendence
```

This is required because containers must talk to each other through service names, not `localhost`

### 2. Run Backend and Frontend Manually

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

For this mode:

- `backend/.env` works as-is because it points to `localhost:5432`
- the backend does not need `PORT` in `.env` because the app already defaults to `3001`
- the frontend can rely on its built-in fallback to `http://localhost:3001`
- if you want to be explicit on the frontend, create `frontend/.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Current Expected Files

- `backend/.env`
  - Real local backend env file
  - Ignored by git

- `.env.example`
  - Tracked template for teammates

- `frontend/.env.local`
  - Optional
  - Only needed if you want to override the frontend API URL

## Summary

- Create and keep `backend/.env` for local backend development
- Keep `.env.example` updated whenever env variables change
- Use Docker Compose if you want the full stack together
- Use `frontend/.env.local` only if the frontend API URL needs to change
