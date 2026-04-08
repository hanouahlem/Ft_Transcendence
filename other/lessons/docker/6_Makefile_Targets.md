# Makefile Targets

## What this does

The Makefile is the shortcut layer for the Docker workflow. It keeps the common commands short and avoids repeating long `docker compose` commands.

Current definitions come from [`Makefile`](/Users/curtis/Desktop/DEV/last_jeune/Makefile).

## Why `make up` no longer rebuilds

`make up` now runs:

```makefile
up:
	$(COMPOSE) up
```

This starts the existing images and containers without forcing a rebuild every time. That matches the current dev setup better because:

- source code is bind-mounted into the containers
- hot reload already picks up most code edits
- rebuilding is only needed when the Dockerfile or dependencies change

## When to use each target

`make up`
: start the stack fast, without rebuilding images

`make up-build`
: start the stack and force a rebuild first

`make restart`
: stop the stack and start it again without rebuilding

`make build`
: build the images, but do not start containers

`make rebuild`
: build the images and then start the stack

`make down`
: stop and remove containers and the default network

`make clean`
: remove containers, network, and volumes managed by Compose

`make fclean`
: do `clean` and also prune Docker system data

`make db-clean`
: wipe the PostgreSQL schema through Prisma migrations, then re-apply all migrations without stopping containers

`make seed`
: run `make db-clean` first, then execute the legacy `other/seed.sh` host script

`make superseed`
: run `make db-clean` first, then execute `other/superseed.sh` from the host to recreate the deterministic generator-backed social dataset: users, profiles, friendship graph, posts, likes, favorites, comments, avatars, and seeded post images

## How this works

The important distinction is:

- `docker compose up` uses existing images if they are already available
- `docker compose up --build` rebuilds images before starting
- bind mounts handle live source changes, so rebuilding is not required for ordinary edits
- `make db-clean` runs `npx prisma migrate reset --force` inside the running `backend` container, so the database is reset in place while containers keep running
- `make seed` first runs `make db-clean`, then runs the older `bash other/seed.sh` host script
- `make superseed` first runs `make db-clean`, then runs `bash other/superseed.sh` on the host
- [`other/superseed.sh`](/Users/curtis/Desktop/DEV/last_jeune/other/superseed.sh) only resolves the repo root, reads `SEED_SCRIPT_KEY`, and launches [`other/seed/seed.mjs`](/Users/curtis/Desktop/DEV/last_jeune/other/seed/seed.mjs)
- [`other/seed/seed.mjs`](/Users/curtis/Desktop/DEV/last_jeune/other/seed/seed.mjs) loads curated config from [`other/seed/config/roster.json`](/Users/curtis/Desktop/DEV/last_jeune/other/seed/config/roster.json) and the other files in [`other/seed/config/`](/Users/curtis/Desktop/DEV/last_jeune/other/seed/config), builds a deterministic plan, then talks to the backend over `http://localhost:3001`
- because the host only needs Node's built-in runtime and `fetch`, the seed still works without host-side Prisma dependencies

That means the default path should be `make up`, while `make up-build` and `make rebuild` stay available for dependency or Dockerfile changes.

## Why `db-clean` keeps containers alive

The target is:

```makefile
db-clean:
	$(COMPOSE) exec backend sh -c '$(DB_URL) npx prisma migrate reset --force'
```

What it does:

- `docker compose exec backend`: run the command inside the existing backend container
- `DB_URL`: points Prisma at the Docker Postgres service host `postgres`
- `prisma migrate reset --force`: drop the current schema, recreate it, and apply every migration again
- because it uses `exec`, the `backend` container must already be running, which matches the normal `make up` workflow

Why that matters:

- it clears application data without removing the `postgres` container
- it avoids deleting Compose-managed containers or networks
- it restores the schema from the tracked migration history, so the database returns to a known state

## Terms to know

- `bind mount`: a host folder mounted into the container
- `image`: the built filesystem snapshot used to create a container
- `container`: the running instance created from an image
- `rebuild`: regenerate the image from the Dockerfile before starting
- `migration reset`: Prisma workflow that drops the schema and rebuilds it from migration files
- `seed script`: repeatable setup script that inserts a predictable demo dataset for development and evaluation
- `thin wrapper`: small shell entrypoint that only prepares env values and delegates the real logic elsewhere
