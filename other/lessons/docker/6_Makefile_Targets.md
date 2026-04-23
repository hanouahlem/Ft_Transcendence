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
: remove evaluation containers/orphans and local compose images while keeping named volumes

`make fclean`
: remove evaluation containers/orphans, local compose images, and named volumes

`make nuke`
: run `docker system prune -af --volumes` as an explicit global cleanup command

`make db-clean`
: wipe the PostgreSQL schema through Prisma migrations, then re-apply all migrations without stopping containers

`make seed`
: run `make db-clean` first, then execute the small backend-side seed script inside the running `backend` container

`make superseed`
: run `make db-clean` first, then execute the larger generator-backed seed inside the running `backend` container to recreate the deterministic social dataset: users, profiles, friendship graph, posts, likes, favorites, comments, avatars, and seeded post images

## How this works

The important distinction is:

- `make up` now uses `docker compose -f docker-compose.eval.yml up --build`, so the default demo path is the immutable evaluation stack
- `make down` intentionally does **not** pass `-v`, because the evaluation stack is supposed to keep `postgres_data` and `uploads_data` across restarts
- `make clean` runs `down --remove-orphans --rmi local`, so it removes stale containers and project images but keeps named volumes
- `make fclean` runs `down -v --remove-orphans --rmi local`, so it does the same cleanup plus volume removal
- `make dev-up` still uses `docker compose up`, so the bind-mounted hot-reload workflow stays available for daily development
- `make dev-clean` mirrors `clean` for the dev stack (`--remove-orphans --rmi local`)
- `make dev-fclean` mirrors `fclean` for the dev stack (`-v --remove-orphans --rmi local`)
- `make nuke` is intentionally separate because `docker system prune -af --volumes` is global, not project-scoped
- `make db-clean` runs `npx prisma migrate reset --force` inside the running development `backend` container, so the development database is reset in place while containers keep running
- `make seed` first runs `make db-clean`, then runs `node scripts/seed/legacy-seed.mjs` inside the development `backend` container
- `make superseed` first runs `make db-clean`, then runs `node scripts/seed/superseed.mjs` inside the development `backend` container
- [`backend/scripts/seed/superseed.mjs`](/Users/curtis/Desktop/DEV/main_transcendance/backend/scripts/seed/superseed.mjs) loads curated config from [`backend/scripts/seed/config/roster.json`](/Users/curtis/Desktop/DEV/main_transcendance/backend/scripts/seed/config/roster.json) and the other files in [`backend/scripts/seed/config/`](/Users/curtis/Desktop/DEV/main_transcendance/backend/scripts/seed/config), builds a deterministic plan, then talks to the backend over `http://backend:3001`
- because the scripts run inside the container, they use the same backend network and environment as the app itself

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

## Devcontainer lifecycle targets

What this does:

- `make dc-build` builds the devcontainer image used by editor tooling and CLI workflows
- `make dc-clean` removes the devcontainer container/image, deletes its dedicated `node_modules` volumes, and prunes builder cache

Why it is needed:

- teammates can reset a broken devcontainer state in one command
- dedicated volumes (`ft_devcontainer_backend_modules`, `ft_devcontainer_frontend_modules`) keep dependency storage separate from app runtime volumes
- cleanup stays explicit and project-focused, which is easier to explain during evaluation

How it works in this codebase:

```makefile
dc-build:
	$(DOCKER) build -f .devcontainer/Dockerfile -t ft_devcontainer .

dc-clean:
	-$(DOCKER) rm -f ft_devcontainer
	-$(DOCKER) rmi ft_devcontainer
	-$(DOCKER) volume rm ft_devcontainer_backend_modules ft_devcontainer_frontend_modules
	$(DOCKER) builder prune -f
```

Key evaluator terms:

- `docker build`: creates an image from a Dockerfile
- `docker rm -f`: force removes a container (stops it first if needed)
- `docker rmi`: removes an image
- `docker volume rm`: removes named Docker volumes
- `docker builder prune`: removes build cache layers

## Terms to know

- `bind mount`: a host folder mounted into the container
- `image`: the built filesystem snapshot used to create a container
- `container`: the running instance created from an image
- `rebuild`: regenerate the image from the Dockerfile before starting
- `migration reset`: Prisma workflow that drops the schema and rebuilds it from migration files
- `seed script`: repeatable setup script that inserts a predictable demo dataset for development and evaluation
- `thin wrapper`: small shell entrypoint that only prepares env values and delegates the real logic elsewhere
