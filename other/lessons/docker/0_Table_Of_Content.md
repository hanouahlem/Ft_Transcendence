# Docker Table Of Content

Quick study checklist:

- [ ] I can explain what each service in `docker-compose.dev.yml` does
- [ ] I understand bind mounts vs Docker volumes vs anonymous volumes
- [ ] I know how services talk to each other (networking, hostnames)
- [ ] I can explain the difference between `env_file` and `environment` in Compose
- [ ] I understand the backend startup command and why each step matters
- [ ] I know why `DATABASE_URL` differs between host and container
- [ ] I can use the Makefile targets for common dev tasks
- [ ] I can explain why the repo has a separate eval stack with nginx + HTTPS
- [ ] I know which section I still need to review in depth

## 1. Volumes

Goal: understand how data flows between the host and containers.

- bind mounts: `./backend:/app`, `./frontend:/app`
- named node_modules volumes: `dev_backend_node_modules`, `dev_frontend_node_modules`
- named volumes: `postgres_data`
- why `node_modules` needs its own volume
- why uploads are stored in named Docker volumes
- dev-oriented vs infra-oriented volume strategy

Study file:

- `lessons/docker/notes.md`

## 2. Compose Structure and Service Roles

Goal: understand what `docker-compose.dev.yml` defines and how services relate.

- three services: `postgres`, `backend`, `frontend`
- `build` vs `image` (backend/frontend build from Dockerfile, postgres uses an image)
- `depends_on` with `condition: service_healthy`
- healthchecks: `pg_isready` for postgres, `/health` endpoint for backend
- `restart: always`
- startup order: postgres → backend → frontend

Study file:

- `lessons/docker/2_Compose_Structure.md`

## 3. Networking and Ports

Goal: understand how containers find each other and how the host accesses them.

- Compose default network: all services share one network
- service name = hostname inside Docker (`postgres`, `backend`, `frontend`)
- why `localhost` does not work between containers
- port mapping: `"3000:3000"`, `"3001:3001"`, `"5432:5432"`, `"5555:5555"`
- left side = host port, right side = container port

Study file:

- `lessons/docker/3_Networking_and_Ports.md`

## 4. Environment Variables

Goal: understand how env vars reach the containers and common pitfalls.

- `env_file`: loads `.env` into the container at runtime
- `environment`: values interpolated by Compose on the host at parse time
- why `${POSTGRES_USER}` in `environment` resolves to empty (host doesn't have it)
- why `$$POSTGRES_USER` in `command` resolves correctly (shell runs inside container)
- `DATABASE_URL` on host (`localhost`) vs in Docker (`postgres`)

Study file:

- `lessons/docker/4_Environment_Variables.md`

## 5. Backend Startup Command

Goal: understand what happens when the backend container starts.

- the full command: `prisma generate && prisma migrate deploy && npm run dev`
- why `DATABASE_URL` is built at runtime with `$$` escaping
- `prisma generate`: syncs Prisma client with schema (no DB change)
- `prisma migrate deploy`: applies pending migrations (changes DB)
- `prisma migrate deploy` vs `prisma migrate dev` (safe vs interactive)
- `npm run dev`: starts the Express server with hot reload

Study file:

- `lessons/docker/5_Backend_Startup.md`

## 6. Makefile Targets

Goal: know the shortcuts and how they work under the hood.

- `make up` / `make down` / `make restart`: evaluation lifecycle
- `make dev-up` / `make dev-down` / `make dev-restart`: development lifecycle
- `make up-build` / `make rebuild`: explicit evaluation rebuild workflows
- `make clean` / `make fclean` / `make re`: cleanup and rebuild
- `make db-clean`: reset the PostgreSQL schema without removing containers
- `make prisma-migrate`: runs `prisma migrate dev` inside Docker with correct `DATABASE_URL`
- `make prisma-studio`: runs Prisma Studio on port 5555 with `--browser none`
- `make dev`: shortcut for `make dev-up`
- `make frontend` / `make backend`: run services locally without Docker

Study file:

- `lessons/docker/6_Makefile_Targets.md`

## 7. Evaluation Stack, HTTPS, and OAuth Routing

Goal: understand the production-like stack used for peer evaluation.

- why `docker-compose.yml` (eval) exists next to `docker-compose.dev.yml` (dev)
- immutable backend/frontend images in eval
- backend entrypoint: `prisma migrate deploy` then `node src/server.js`
- nginx TLS termination on `443`
- why frontend uses `https://localhost:4433/api` in eval
- why OAuth callbacks and handoff routes are split between backend and frontend
- why secure OAuth state cookies are enabled under HTTPS
- why Express trusts proxy headers in this flow
- why uploads move to a named Docker volume in eval

Study file:

- `lessons/docker/7_Eval_Stack_HTTPS_And_OAuth_Routing.md`

## Recommended Walkthrough Order

1. Volumes
2. Compose Structure and Service Roles
3. Networking and Ports
4. Environment Variables
5. Backend Startup Command
6. Makefile Targets

## Notes

- Use this as a study map, not as a full explanation document.
- Section 1 already exists. Other sections are created as needed.
- If one section feels unclear, drill into that section before moving on.
- Every explanation should stay consistent with `other/transcendance.md`, which is the project source of truth.
