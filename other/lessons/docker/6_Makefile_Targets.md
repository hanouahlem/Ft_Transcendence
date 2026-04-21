# Makefile Targets

## What this does

The Makefile is the shortcut layer for the Docker workflow. It keeps the common commands short and avoids repeating long `docker compose` commands.

Current definitions come from [`Makefile`](/Users/curtis/Desktop/DEV/main_transcendance/Makefile).

## Why `make up` now targets evaluation

`make up` now runs:

```makefile
up:
	$(EVAL_COMPOSE) up --build
```

This now starts the evaluation stack by default because the project needs a single-command containerized deployment for peer evaluation.

The hot-reload dev flow moved to `make dev-up`, which still uses the normal `docker-compose.yml`.

## Why `make dev-up` matches the old workflow

`make dev-up` runs:

```makefile
dev-up:
	$(DEV_COMPOSE) up
```

That keeps the previous behavior:

- source code is bind-mounted into the containers
- hot reload already picks up most code edits
- rebuilding is only needed when the Dockerfile or dependencies change

## When to use each target

`make up`
: build and start the evaluation stack from `docker-compose.eval.yml`

`make up-build`
: explicit rebuild for the evaluation stack

`make restart`
: restart the evaluation stack

`make build`
: build the evaluation images without starting containers

`make rebuild`
: rebuild the evaluation images and start the evaluation stack

`make dev`
: shortcut for `make dev-up`

`make dev-up`
: start the bind-mounted development stack

`make dev-up-build`
: rebuild and start the development stack

`make dev-down`
: stop the development containers

`make down`
: stop and remove the evaluation containers without deleting named volumes

`make clean`
: remove the evaluation containers, network, and named volumes

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

- `make up` now uses `docker compose -f docker-compose.eval.yml up --build`, so the default demo path is the immutable evaluation stack
- `make down` intentionally does **not** pass `-v`, because the evaluation stack is supposed to keep `postgres_data` and `uploads_data` across restarts
- `make dev-up` still uses `docker compose up`, so the bind-mounted hot-reload workflow stays available for daily development
- `make dev-fclean` runs `find backend/uploads -mindepth 1 -delete`, which clears every uploaded media file while preserving the `backend/uploads` directory expected by Multer
- `make db-clean` runs `npx prisma migrate reset --force` inside the running development `backend` container, so the development database is reset in place while containers keep running
- `make seed` first runs `make db-clean`, then runs the older `bash other/seed.sh` host script
- `make superseed` first runs `make db-clean`, then runs `bash other/superseed.sh` on the host
- [`other/superseed.sh`](/Users/curtis/Desktop/DEV/main_transcendance/other/superseed.sh) only resolves the repo root, reads `SEED_SCRIPT_KEY`, and launches [`other/seed/seed.mjs`](/Users/curtis/Desktop/DEV/main_transcendance/other/seed/seed.mjs)
- [`other/seed/seed.mjs`](/Users/curtis/Desktop/DEV/main_transcendance/other/seed/seed.mjs) loads curated config from [`other/seed/config/roster.json`](/Users/curtis/Desktop/DEV/main_transcendance/other/seed/config/roster.json) and the other files in [`other/seed/config/`](/Users/curtis/Desktop/DEV/main_transcendance/other/seed/config), builds a deterministic plan, then talks to the backend over `http://localhost:3001`
- because the host only needs Node's built-in runtime and `fetch`, the seed still works without host-side Prisma dependencies

That means:

- `make up` is the evaluation path
- `make dev` or `make dev-up` is the daily development path

## Why `db-clean` keeps containers alive

The target is:

```makefile
db-clean:
	$(DEV_COMPOSE) exec backend sh -c '$(DB_URL) npx prisma migrate reset --force'
```

What it does:

- `docker compose exec backend`: run the command inside the existing backend container
- `DB_URL`: points Prisma at the Docker Postgres service host `postgres`
- `prisma migrate reset --force`: drop the current schema, recreate it, and apply every migration again
- because it uses `exec`, the development `backend` container must already be running, which matches the normal `make dev-up` workflow

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
