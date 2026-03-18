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

Docker:

```bash
make up
```

Useful commands:

```bash
make down
make logs
make ps
make db
```

## Environment

- local backend env lives in `backend/.env`
- backend template lives in `backend/.env.example`
- optional frontend template lives in `frontend/.env.local.example`
- detailed setup notes live in `DEV_DOCS.md`

## Main Docs

- `DEV_DOCS.md`: environment setup and run modes
- `transcendance.md`: 42 subject and requirements
- `lessons.md`: team learning notes
- `AGENTS.md`: project-specific working conventions

## serveur frontend 

cd frontend -> npm run dev == serveur qui affiche les pages

## serveur back

cd backend -> npm run dev == serveur qui recois les info du front et lui renvoi 

## Tools

//view the databases by browser//

Prisma studio : 
docker compose up -d
cd Backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma studio


## Resources

- https://docs.astro.build/fr/guides/backend/prisma-postgres/
- https://laconsole.dev/formations/express/middlewares
