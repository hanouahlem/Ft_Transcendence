# Dev Docs

## Env Files

- `backend/.env`: eval backend env file
- `backend/.env.example`: eval backend env template
- `backend/.env.dev`: dev backend env file
- `backend/.env.dev.example`: dev backend env template
- `frontend/.env.local`: optional local frontend env file
- `frontend/.env.local.example`: frontend env template

Backend env:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=transcendence
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/transcendence
JWT_SECRET=dev-secret-change-me
```

Frontend env:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Notes:

- the backend defaults to port `3001`
- Docker Compose sets `PORT=3001` for the backend container
- in Docker stacks, `DATABASE_URL` uses service host `postgres` (not `localhost`)
- `POSTGRES_*` is shared by the `postgres` and `backend` services through the selected env file (`backend/.env` for eval, `backend/.env.dev` for dev)

## Run Commands

Docker lifecycle:

```bash
make up          # build and start all services
make down        # stop services (keeps data)
make restart     # down + up
make logs        # follow all service logs
make ps          # show running containers
make clean       # down + remove compose images (keeps volumes)
make fclean      # clean + remove volumes (deletes DB/uploads data)
make nuke        # global docker prune + unused volumes (all projects)
make re          # fclean + up
make db          # start only postgres in background
```

Devcontainer workflow:

1. Reopen the repo in the devcontainer
2. Run `make up`
3. Run `make down` when you want to stop the stack
4. Run `make studio` when you want Prisma Studio on `http://localhost:5555`

Devcontainer notes:

- the repo includes `.devcontainer/` for editor tooling and AI CLIs
- the container mounts the repo at the exact same absolute path as the host path
- this is required because `docker compose` talks to the host Docker socket, and the bind mounts in `docker-compose.dev.yml` must resolve to real host paths
- the app still runs through the normal Docker stack, not inside the devcontainer itself
- browser access stays on `http://localhost:3000`
- API access stays on `http://localhost:3001`
- Prisma Studio stays on `http://localhost:5555`
- `post-create.sh` copies missing env files from the examples and installs frontend/backend dependencies for editor tooling
- Claude Code, Codex, and OpenCode config directories are mounted from the host into the devcontainer so their auth and local settings persist

Prisma (runs inside the backend container):

```bash
make migrate          # run prisma migrate dev (create/apply migrations)
make studio           # open Prisma Studio on http://localhost:5555
make ms               # migrate + open Prisma Studio
make prisma-generate  # regenerate Prisma client
```

Prisma Studio is exposed on `http://localhost:5555`.

Manual (without Docker, requires local Postgres):

```bash
make frontend    # install deps + run Next.js dev server
make backend     # install deps + run Express dev server
```

Seed the database (requires the dev Docker backend container running):

```bash
make seed
make superseed
```

Docker behavior:

- backend and frontend use the dependencies already installed in their images
- backend runs `prisma generate` and `prisma migrate deploy` on startup for dev consistency
- frontend waits for backend health, and backend waits for Postgres health

## Implemented API

Auth and users:

- `POST /registerUser`
- `POST /login`
- `GET /users`
- `GET /user`
- `GET /users/search`

Friends:

- `POST /friends`
- `GET /friends`
- `PUT /friends/:id`
- `DELETE /friends/:id`
- `GET /friends/requests`

Posts:

- `GET /posts`
- `POST /posts`
- `DELETE /posts/:id`
- `POST /posts/:id/like`
- `DELETE /posts/:id/like`

Infra:

- `GET /health`

Protected routes use `Authorization: Bearer <token>`.

## Implemented Frontend Pages

- `/`
- `/login`
- `/register`
- `/feed`
- `/friends`
- `/notifications`
- `/profil`
- `/settings/profile`
- `/settings/security`
- `/settings/notifications`

## Uploads and Persistence

- uploads are handled by Multer in `backend/src/middleware/upload.js`
- post uploads accept images and PDFs, while settings media accepts images only
- uploaded files are written to `uploads/` inside the backend container
- both Docker compose flows mount that path as the named volume `uploads_data`
- Express serves them from `/uploads`

Docker persistence:

- Postgres data lives in the `postgres_data` volume
- uploaded media lives in the `uploads_data` volume
- `make down` keeps database data
- `make clean` keeps both Docker volumes but removes local compose images
- `make fclean` removes both Docker volumes and local compose images

Local persistence:

- local Postgres persistence depends on your local setup
- outside Docker, uploaded files still live in the backend `uploads/` folder
