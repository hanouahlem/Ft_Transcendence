# Makefile Targets

## What this does

The Makefile is the shortcut layer for the Docker workflow. It keeps the common commands short and avoids repeating long `docker compose` commands.

Current definitions come from [`Makefile`](/Users/curtis/Desktop/DEV/Ft_Transcendence/Makefile).

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

## How this works

The important distinction is:

- `docker compose up` uses existing images if they are already available
- `docker compose up --build` rebuilds images before starting
- bind mounts handle live source changes, so rebuilding is not required for ordinary edits

That means the default path should be `make up`, while `make up-build` and `make rebuild` stay available for dependency or Dockerfile changes.

## Terms to know

- `bind mount`: a host folder mounted into the container
- `image`: the built filesystem snapshot used to create a container
- `container`: the running instance created from an image
- `rebuild`: regenerate the image from the Dockerfile before starting
