# Dev Docs

## Env Files

- `backend/.env`: real local backend env file
- `backend/.env.example`: backend env template
- `frontend/.env.local`: optional local frontend env file
- `frontend/.env.local.example`: frontend env template

Backend env:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=transcendence
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/transcendence
JWT_SECRET=dev-secret-change-me
```

Frontend env:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Notes:

- the backend defaults to port `3001`
- Docker Compose sets `PORT=3001` for the backend container
- Docker builds the backend container `DATABASE_URL` from `POSTGRES_*` and uses host `postgres` instead of `localhost`
- `POSTGRES_*` is shared by the `postgres` and `backend` services through `backend/.env`

## Run Commands

Docker:

```bash
make up
make down
make logs
make ps
make clean
```

Docker behavior:

- backend and frontend use the dependencies already installed in their images
- backend still runs `prisma generate` and `prisma migrate deploy` on startup for dev consistency
- frontend waits for backend health, and backend waits for Postgres health

Manual:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

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
- only image files are accepted
- uploaded files are stored in `backend/uploads/`
- Express serves them from `/uploads`

Docker persistence:

- Postgres data lives in the `postgres_data` volume
- `make down` keeps database data
- `make clean` removes the Docker database volume
- `make clean` does not remove files from `backend/uploads/`

Local persistence:

- local Postgres persistence depends on your local setup
- uploaded files still live in `backend/uploads/`
