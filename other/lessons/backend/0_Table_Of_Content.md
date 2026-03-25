# Backend Table Of Content

Quick study checklist:

- [ ] I understand what each service does: `frontend`, `backend`, `postgres`
- [ ] I can explain how a request goes from the browser to the backend and back
- [ ] I understand how JWT auth works in this project
- [ ] I understand how Prisma talks to PostgreSQL
- [ ] I can explain what each backend controller is responsible for
- [ ] I understand how file uploads work
- [ ] I know the main Docker/dev workflow and common failure cases
- [ ] I know which section I still need to review in depth

## 1. Runtime Architecture

Goal: understand what starts, in what order, and who talks to whom.

- Docker Compose roles: `postgres`, `backend`, `frontend`
- Express server lifecycle in `backend/src/server.js`
- env loading and startup validation in `backend/src/env.js`
- why `DATABASE_URL` differs between local and Docker

Study file:

- `lessons/backend/1_Runtime_Architechture.md`

## 2. HTTP and Express Basics

Goal: understand HTTP, what an Express server is, and the core app methods before route architecture.

- HTTP basics: client, server, request, response
- what Express does and what `const app = express()` creates
- handler functions, `app.get(...)`, and `app.use(...)`
- middleware basics
- JSON parsing, CORS, static files
- light introduction to route mounting

Study file:

- `lessons/backend/2_HTTP_and_Express_Basics.md`

## 3. Routing and Request Flow

Goal: know what happens from a frontend request to a backend response.

- how routes are declared
- difference between `app.get(...)` and `router.get(...)`
- route mounting in practice
- how a request moves from route to controller
- protected vs public routes
- where `req`, `res`, `next` come from

Study file:

- `lessons/backend/3_Routing_and_Request_Flow.md`

## 4. Authentication and Authorization

Goal: understand login and protected routes.

- JWT creation on login
- JWT verification in middleware
- `Authorization: Bearer ...`
- how `req.user` gets attached
- difference between "authenticated" and "authorized"

Study file:

- `lessons/backend/4_Authentication_and_Authorization.md`

## 4b. OAuth and External Authentication

Goal: understand how GitHub or 42 OAuth would plug into the existing JWT auth flow.

- why OAuth is optional in the subject
- why backend-driven OAuth fits this repo
- provider token vs app JWT
- how external auth would connect to Prisma users and `AuthContext`

Study file:

- `lessons/backend/4b_OAuth_and_External_Authentication.md`

## 5. Prisma and Database Layer

Goal: understand how backend code talks to Postgres.

- what Prisma is
- what `schema.prisma` defines
- what migrations are
- difference between `prisma generate` and `prisma migrate deploy`
- how `backend/src/prisma.js` creates the DB client

Study file:

- `lessons/backend/5_Prisma_and_Database_Layer.md`

## 6. Business Logic by Feature

Goal: understand what each controller is responsible for.

- users/auth
- friends
- posts
- how handlers query and update the DB
- how status codes and error responses are chosen

Study file:

- `lessons/backend/6_Business_Logic_by_Feature.md`

## 7. File Uploads and Static Media

Goal: understand how images move through the backend.

- what Multer does
- `upload.single("media")`
- where uploaded files are stored
- how `/uploads/...` is served back to the frontend

Study file:

- `lessons/backend/7_File_Uploads_and_Static_Media.md`

## 8. Dev Workflow and Failure Modes

Goal: understand how to run and debug the backend confidently.

- Docker vs local run
- what startup checks fail on
- healthcheck route
- common failure cases:
  - missing env
  - DB not ready
  - migration mismatch
  - invalid JWT
  - upload errors

Study file:

- `lessons/backend/8_Dev_Workflow_and_Failure_Modes.md`

## Recommended Walkthrough Order

1. Runtime Architecture
2. HTTP and Express Basics
3. Routing and Request Flow
4. Authentication and Authorization
5. OAuth and External Authentication
6. Prisma and Database Layer
7. Business Logic by Feature
8. File Uploads and Static Media
9. Dev Workflow and Failure Modes

## Notes

- Use this as a study map, not as a full explanation document.
- We create each concept file when we start that section.
- If one section feels unclear, drill into that section before moving on.
- Every explanation should stay consistent with `transcendance.md`, which is the project source of truth.
