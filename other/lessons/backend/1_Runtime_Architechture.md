# 1. Runtime Architecture

Goal: understand what starts, in what order, and who talks to whom.

## Big Picture

This project runs 3 services defined in `docker-compose.yml`:

- `postgres`: the PostgreSQL database
- `backend`: the Express API
- `frontend`: the Next.js app

The communication flow is:

```text
Browser
  -> frontend (:3000)
  -> backend (:3001)
  -> postgres (:5432)
```

Important rule:

- the frontend never talks directly to PostgreSQL
- the backend is the only service that talks to the database

## Startup Order

Docker Compose starts the services in this order:

1. `postgres`
2. `backend`
3. `frontend`

But not just by order in the file. It also uses readiness checks:

- backend waits for Postgres to be healthy
- frontend waits for backend to be healthy

This is important because:

- the backend should not start before the DB is ready
- the frontend should not start before the API is ready

## What the Backend Entry Point Does

The backend starts from `backend/src/server.js`.

That file does the bootstrap work:

1. validates env variables
2. creates the Express app
3. enables middleware like `cors()` and `express.json()`
4. exposes `/health`
5. serves uploaded files through `/uploads`
6. mounts the main routes from `backend/src/routes/routes.js`
7. starts listening on port `3001` by default

So `server.js` is the main startup file of the API.

## Env Loading

Before the server starts, `server.js` calls `validateEnv()` from `backend/src/env.js`.

That means:

- load the backend `.env`
- check that required values exist
- stop startup early if something important is missing

In this project, the critical ones are:

- `DATABASE_URL`
- `JWT_SECRET`

This is better than failing later in the middle of a request.

## Why DATABASE_URL Changes in Docker

When you run the backend locally, Postgres is reached through:

- `localhost`

When the backend runs inside Docker, Postgres is reached through:

- `postgres`

Why?

Because Docker Compose gives each service a network name based on the service name. Inside the Docker network:

- `postgres` means the Postgres container
- `localhost` means the current container itself

So inside the backend container:

- `localhost` would point to the backend container
- not to the database

That is why Docker startup overrides `DATABASE_URL` to use host `postgres`.

## Healthchecks

This project uses healthchecks to know when services are really ready.

### Postgres healthcheck

Postgres is checked with `pg_isready`.

That tells Docker whether the database is accepting connections.

### Backend healthcheck

The backend exposes:

- `GET /health`

That route returns a simple success response so Docker can test:

- is the Express server actually running and reachable?

This is different from just knowing:

- the container process started

## Dev-Specific Setup

This Compose setup is a development setup, not a production one.

Why:

- backend source is bind-mounted into the container
- frontend source is bind-mounted into the container
- backend runs `npm run dev`
- frontend runs `npm run dev`

So the containers are being used as a dev environment with hot reload.

## Mental Model to Remember

Keep this map in your head:

- `docker-compose.yml` = which services run together and in what order
- `backend/src/server.js` = how the API process boots
- `backend/src/env.js` = startup safety checks
- `backend/src/routes/routes.js` = the app endpoints
- `postgres` = the persistent data store

## Self-Check Questions

- Can I explain why the frontend must not talk directly to PostgreSQL?
- Can I explain why Docker uses host `postgres` instead of `localhost`?
- Can I explain the difference between "container started" and "service healthy"?
- Can I explain what `server.js` does before the server starts listening?
