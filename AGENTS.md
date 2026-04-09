# Agent Instructions — ft_transcendence

## What is this project?

A **42 school group project** where 4-5 students build a full-stack web application. The project is graded on module points (need 14 minimum) and every team member must be able to explain the entire codebase during a live evaluation. If a student can't explain code they submitted, they fail.

## Source of truth

The file `other/transcendance.md` is the **official project subject** from 42. All requirements, module definitions, grading criteria, and constraints come from this document. Always reference it before making architectural decisions or claiming a module is complete. Never add features or modules without checking it first.

## Stack

- **Frontend:** Next.js (App Router) + Tailwind CSS + shadcn/ui — runs on port 3000
- **Backend:** Express.js + Prisma ORM — runs on port 3001
- **Database:** PostgreSQL — runs on port 5432
- **Real-time:** Socket.io (attached to the Express server)
- **Auth:** JWT tokens stored in localStorage, bcrypt for password hashing
- **Deployment:** Docker Compose (single `docker compose up` to run everything)

## Key files

- `other/transcendance.md` — the 42 subject (source of truth)
- `other/lessons/` — team learning notes (see below)
- `backend/.env.example` — backend environment template
- `frontend/.env.local.example` — frontend environment template
- `frontend/lib/api.ts` — all frontend API calls
- `frontend/context/AuthContext.tsx` — auth state (token, user, login/logout)
- `frontend/context/SocketContext.tsx` — WebSocket connection and online users
- `backend/src/controllers/controller.js` — all route handlers
- `backend/src/routes/routes.js` — route definitions
- `backend/src/middleware/auth.js` — JWT verification middleware
- `backend/prisma/schema.prisma` — database schema

## Updating Team Lessons

`other/lessons/` is the team learning area. It exists so students can review what they need to know before evaluation. When you implement or change something:

1. **Check first** — read the relevant file under `other/lessons/` to see if the topic already has a section
2. **Update or add** — if the topic exists, update it. If not, add a new numbered section
3. **Use real code** — snippets should come from the actual codebase, not generic examples. Include file paths
4. **Explain for students** — write as if explaining to a teammate who wasn't present when the code was written. Cover:
   - What this does
   - Why it's needed
   - How it works (brief, with code)
   - Key terms an evaluator might ask about
5. **Verify against the subject** — cross-check any claims about requirements or module criteria against `other/transcendance.md`
6. **Keep it concise** — each section should be scannable in under 2 minutes
7. **Core teachings, not refactor history** — A lesson should still make sense if the reader never saw the previous version of the codebase.

## Project structure

```
Ft_Transcendence/
├── frontend/          # Next.js app (port 3000)
│   ├── app/           # Pages and layouts (App Router)
│   ├── components/    # UI components (shadcn + custom ft_ components)
│   ├── context/       # AuthContext, SocketContext
│   └── lib/           # API helpers, utilities
├── backend/           # Express.js API (port 3001)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── middleware/
│   └── prisma/        # Schema and migrations
├── docker-compose.yml
├── backend/.env.example            # Backend env template
├── frontend/.env.local.example     # Frontend env template
├── other/
│   ├── transcendance.md   # 42 subject (source of truth)
│   └── lessons/           # Team learning notes
```


## Git commits

- Use short commit messages with a prefix: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`
- Group changes by logical unit, not by file
- Use `git add <specific files>` — never `git add .` or `git add -A`
- Always show the proposed commit message first and ask for approval before committing
- Do not add yourself as co-author
- Do not push unless explicitly asked

## Conventions

- Secrets in `.env`, never in code or docker-compose. Update the relevant env example file when adding new vars
- Frontend and backend are separate services communicating via REST API and WebSockets
- Forms use `noValidate` — all validation is in JavaScript handlers
- Auth flow: JWT in localStorage, `Authorization: Bearer <token>` header for protected routes
- Keep changes strictly within the requested scope. Do not bundle adjacent cleanup or unrelated refactors unless the user explicitly asks for them.
