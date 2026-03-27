# Docker Notes

## Current Project Volume Setup

In the current `docker-compose.yml`:

- `./backend:/app` is a bind mount
- `./frontend:/app` is a bind mount
- `/app/node_modules` is an anonymous Docker volume
- `postgres_data:/var/lib/postgresql/data` is a named Docker volume

What that means:

- backend and frontend source code come directly from the local repo
- `node_modules` stays inside Docker so the host bind mount does not replace it
- Postgres data is persisted by Docker outside the container lifecycle

## Bind Mount vs Docker Volume

### Bind mount

Example:

```yml
- ./backend:/app
```

Meaning:

- left side is a real host folder
- right side is a folder inside the container

So the container uses the host files directly.

### Anonymous volume

Example:

```yml
- /app/node_modules
```

Meaning:

- Docker creates managed storage for that container path
- it is not mapped to a repo folder on the host

### Named volume

Example:

```yml
- postgres_data:/var/lib/postgresql/data
```

Meaning:

- Docker creates persistent managed storage with a reusable name

## Why `node_modules` Gets Its Own Volume

With:

```yml
- ./backend:/app
```

the whole `/app` directory is replaced by the local `./backend` folder.

If nothing else is done, `/app/node_modules` would also come from the host side.

Using:

```yml
- /app/node_modules
```

creates a separate Docker-managed area for dependencies, so the container keeps its own `node_modules`.

## Why Uploads Currently End Up In The Repo

The backend writes uploads to `uploads/`, which resolves to `/app/uploads` in the container.

Because `/app` is bind-mounted to `./backend`, those files appear in:

- `backend/uploads`

So uploaded files are currently written into the repo working tree.

## Docker Volume For Uploads

If uploads were moved to a dedicated Docker volume:

- the app would still save files to a path like `/app/uploads`
- but the files would live in Docker-managed persistent storage
- they would no longer pollute the repo tree

This would keep runtime data separate from source code.

## Current Project vs Inception Volume Philosophy

Current project:

- volumes are mainly used for development convenience
- bind mounts support hot reload and live code sync

Inception project:

- volumes were mainly used for persistent runtime data
- database files and WordPress files lived outside the container lifecycle

So:

- current project volume strategy is dev-oriented
- Inception volume strategy is infra-oriented

## Dev Compose vs Prod Compose

It is common to have:

- one Compose file for development
- another Compose file or override for production-like runtime

Why:

- dev wants bind mounts, hot reload, debug-friendly behavior
- prod wants immutable images, no live source mounts, tighter secrets and cleaner startup

Our current `docker-compose.yml` is clearly a dev setup.

## Devcontainer With Host Docker Socket

The repo now also includes a `.devcontainer/` setup for coding tools such as Claude Code, Codex, and OpenCode.

Important detail:

- the devcontainer mounts the repo at the exact same absolute path as on the host
- it also mounts `/var/run/docker.sock` from the host

Why this matters:

- `docker compose` runs against the host Docker daemon
- the bind mounts in `docker-compose.yml` use host paths like `./backend` and `./frontend`
- if the repo were mounted inside the devcontainer at a different path, Docker would try to resolve a container-only path that does not exist on the host

So the safe pattern is:

- use the devcontainer for editors, shells, Git, and AI CLIs
- use `make up` from inside the devcontainer to launch the normal host-backed Compose stack
- open the frontend at `http://localhost:3000`
- open Prisma Studio at `http://localhost:5555`

This keeps one source tree, one Docker stack, and one browser workflow.
