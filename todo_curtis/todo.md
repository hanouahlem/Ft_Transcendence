# Todo

Project improvements inspired by the old Inception resources and adapted to the current `ft_transcendence` codebase.

## High Priority

- Remove the remaining scattered `dotenv.config()` calls and keep env loading fully centralized in `backend/src/env.js`.
- Add a backend health endpoint such as `GET /health`.
- Add a backend healthcheck in `docker-compose.yml` so service readiness is explicit, not just database readiness.
- Make backend startup fail clearly if the database is unreachable, not only when the first Prisma query runs.
- Remove hardcoded database credentials from `docker-compose.yml`.
- Move all database config to explicit env variables such as:
  - `POSTGRES_USER`
  - `POSTGRES_DB`
  - backend-side DB host and port variables if needed
- Use Docker secrets for sensitive values:
  - Postgres password
  - JWT secret
- Make Compose use env variables as the source of truth and secrets for confidential values.

## Operations

- Extend the `Makefile` with Prisma commands:
  - `make prisma-generate`
  - `make prisma-migrate`
  - `make prisma-studio`
- Consider adding a `make reset-db` command with clearly documented behavior.
- Keep reset behavior explicit:
  - what deletes Postgres data
  - what preserves Postgres data
  - what happens to uploaded files
  - what happens to local env files

## Persistence

- Decide whether `backend/uploads/` should remain repo-local runtime storage or move to a dedicated Docker volume.
- Document uploads as real application state, not just a helper folder.
- Keep database and media persistence rules explicit in the docs.

## Docker Infra

- Decide clearly which services need host-exposed ports and remove unnecessary ones.
- Keep service-to-service traffic on the Docker network and use published `ports` only for host access.
- Add a backend healthcheck before relying on `depends_on` for frontend startup.
- Stop reinstalling dependencies on every container startup in Compose.
- Make the Dockerfiles and Compose commands consistent about where dependencies are installed and where startup logic lives.
- Remove duplicated config values, especially any database credentials repeated in both service env and connection strings.
- If secrets are introduced, document their creation and usage clearly for the whole team.

## Documentation

- Add a short architecture section in the docs:
  - frontend calls backend over REST
  - backend uses Prisma to talk to Postgres
  - JWT protects private routes
  - uploaded files are stored on disk and served from `/uploads`
- Keep docs updated in the same commit as any setup, env, Docker, or runtime behavior change.
- Continue keeping README short and DEV_DOCS focused on runbook-style information.

## Team Workflow

- Prefer one clear source of truth for environment setup.
- Avoid hidden startup knowledge by documenting common commands and failure cases.
- Keep all changes explainable for evaluation by any teammate.


---
Main weak points:

- The backend and frontend containers reinstall dependencies on every startup in docker-compose.yml:40 and docker-compose.yml:60.
  This makes startup slower and less reproducible, and it partly defeats the point of having backend/Dockerfile:17 and frontend/Dockerfile:5 install
  deps during build.
- The bind mounts in docker-compose.yml:37 and docker-compose.yml:57 overwrite most of what was built into the images.
  So the images are basically dev shells, not meaningful runtime artifacts.
- The frontend depends on the backend in docker-compose.yml:55, but there is no backend healthcheck.
  So Compose knows when Postgres is healthy, but not when the backend is actually ready to serve requests.
- Postgres credentials are hardcoded in docker-compose.yml:6 and docker-compose.yml:32.
  For local dev this is acceptable, but from a Docker-hygiene point of view it is still weak.
- The backend image still contains dead commented-out Dockerfile content in backend/Dockerfile:1.
  Not dangerous, just messy.

What is already good:

- Postgres has a real healthcheck in docker-compose.yml:14.
- Database data is persisted with a named volume in docker-compose.yml:12.
- Backend env handling is now clearer with env_file plus explicit Docker override for DATABASE_URL in docker-compose.yml:27.
- The setup is simple enough for a group project and easy to run.

---
# dev -> prod

• For your current Compose setup, these are good for dev:

  - bind mounts:
      - ./backend:/app
      - ./frontend:/app
        They let code changes appear instantly in containers.
  - dev commands:
      - backend runs npm run dev
      - frontend runs npm run dev
        Good for hot reload and fast iteration.
  - CHOKIDAR_USEPOLLING on frontend
    Useful in Docker dev environments where file watching can be unreliable.
  - exposed ports for all main services you want to inspect locally
      - 3000
      - 3001
      - 5432
        Good for browser testing, API calls, Prisma tools, DB clients.
  - simple local env flow
    Using backend/.env and frontend local env is fine for a dev team.

  What would need to change for a prod-like setup:

  - remove bind mounts
    The container should run the built app artifact, not your live working tree.
  - stop using npm run dev
    Use production startup commands instead:
      - backend: node src/server.js or a proper built output
      - frontend: next build then next start
  - stop running npm install on container startup
    Dependencies should be installed at image build time only.
  - probably remove CHOKIDAR_USEPOLLING
    It is dev-specific.
  - add proper healthchecks
    Especially for backend, not just Postgres.
  - tighten restart policy
    In prod-like mode, restart behavior should reflect service reliability, not dev watch workflows.
  - reduce exposed ports
    Only expose what truly needs host/public access.
    For example:
      - maybe expose only frontend or reverse proxy
      - keep DB internal unless there is a reason to expose it
  - use cleaner secret/config handling
    Move away from hardcoded dev credentials.
    Use env + Docker secrets more seriously.
  - make Dockerfiles real runtime images
    Right now the images are partly undermined by the Compose commands and mounts.
    In prod-like mode, the image should fully define the runtime.

  So the short split is:

  Dev setup priorities:

  - fast iteration
  - hot reload
  - editable mounted source
  - convenience over strictness

  Prod setup priorities:

  - reproducibility
  - immutable images
  - no live source mounts
  - no dev servers
  - stricter health, secrets, and startup behavior

  Your current stack is correctly on the dev side of that line.
