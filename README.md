# ft_transcendence

Full-stack 42 group project built with:

- Next.js frontend on port `3000`
- Express + Prisma backend on port `3001`
- PostgreSQL on port `5432`

## Project Structure

- `frontend/`: Next.js app, pages, and UI components
- `backend/`: Express API, Prisma client, controllers, middleware, and uploads
- `docker-compose.yml`: local Docker stack
- `Makefile`: common Docker and local run commands

## Current Features

- user registration and login with JWT auth
- protected current-user route
- friends search, add, accept, delete, and pending requests
- posts feed with create, delete, like, and unlike
- media upload support for posts


## Quick Start

Evaluation Docker:

```bash
make up
```

Useful eval commands:

```bash
make down
make logs
make ps
make restart
```

## Development Docker

The old hot-reload Docker workflow now lives under `dev-*` targets:

```bash
make dev
```

Useful dev commands:

```bash
make dev-up
make dev-down
make dev-logs
make dev-re
make db
```

## Evaluation Stack

The subject requires a containerized deployment that can be started with a single command. This repo keeps the dev flow in `docker-compose.yml` and uses the default `make up` lifecycle for the evaluation flow in `docker-compose.eval.yml`.

1. Create `backend/.env` from [`backend/.env.example`](/Users/curtis/Desktop/DEV/main_transcendance/backend/.env.example) for the dev stack.
2. Create `backend/.env.eval` from [`backend/.env.eval.example`](/Users/curtis/Desktop/DEV/main_transcendance/backend/.env.eval.example) for the eval stack.
3. Keep the dev OAuth client IDs/secrets in `backend/.env`.
4. Keep the eval OAuth client IDs/secrets in `backend/.env.eval`.
5. Update your GitHub and 42 app settings so their callback URLs exactly match:
   - `https://localhost/auth/github/callback`
   - `https://localhost/auth/42/callback`
6. Generate the local TLS certificate:

```bash
sh other/nginx/generate-eval-cert.sh
```

7. Start the evaluation stack:

```bash
make up
```

Useful eval commands:

```bash
make down
make logs
make re
```

What the eval stack does:

- `postgres`: persistent database volume
- `backend`: built runtime image, runs `backend/entrypoint.sh`, applies Prisma migrations on startup
- `frontend`: built Next.js image using `next build` + `next start`
- `proxy`: nginx on `https://localhost:443`

Important eval rules:

- `GITHUB_CALLBACK_URL` must exactly match the GitHub app callback setting.
- `FORTYTWO_CALLBACK_URL` must exactly match the 42 app callback setting.
- `docker-compose.eval.yml` reads `backend/.env.eval`, so eval OAuth clients stay separate from dev clients.
- The frontend eval build is compiled with `NEXT_PUBLIC_API_URL=https://localhost/api`.
- Generate the TLS cert before testing OAuth, and make sure migrations can run at container startup.

## Environment

- local backend env lives in `backend/.env`
- eval backend env lives in `backend/.env.eval`
- backend templates live in `backend/.env.example` and `backend/.env.eval.example`
- optional frontend template lives in `frontend/.env.local.example`
- detailed setup notes live in `other/DEV_DOCS.md`

## Main Docs

- `other/DEV_DOCS.md`: environment setup and run modes
- `other/transcendance.md`: 42 subject and requirements
- `other/lessons/`: team learning notes
- `AGENTS.md`: project-specific working conventions
- `.devcontainer/`: coding container for Claude Code, Codex, and OpenCode

---
# Notes

## serveur frontend 

cd frontend -> npm run dev == serveur qui affiche les pages

## serveur back

cd backend -> npm run dev == serveur qui recois les info du front et lui renvoi 

## Tools

//view the databases by browser//

Prisma studio : 
docker compose up -d
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma studio


## Resources

- https://docs.astro.build/fr/guides/backend/prisma-postgres/
- https://laconsole.dev/formations/express/middlewares
