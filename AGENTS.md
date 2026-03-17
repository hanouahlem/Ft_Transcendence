# Agent Instructions — ft_transcendence

## What is this project?

A **42 school group project** where 4-5 students build a full-stack web application. The project is graded on module points (need 14 minimum) and every team member must be able to explain the entire codebase during a live evaluation. If a student can't explain code they submitted, they fail.

## Source of truth

The file `transcendance.md` at the repo root is the **official project subject** from 42. All requirements, module definitions, grading criteria, and constraints come from this document. Always reference it before making architectural decisions or claiming a module is complete. Never add features or modules without checking it first.

## Stack

- **Frontend:** Next.js (App Router) + Tailwind CSS + shadcn/ui — runs on port 3000
- **Backend:** Express.js + Prisma ORM — runs on port 3001
- **Database:** PostgreSQL — runs on port 5432
- **Real-time:** Socket.io (attached to the Express server)
- **Auth:** JWT tokens stored in localStorage, bcrypt for password hashing
- **Deployment:** Docker Compose (single `docker compose up` to run everything)

## Key files

- `transcendance.md` — the 42 subject (source of truth)
- `lessons.md` — team learning log (see below)
- `.env.example` — required environment variables
- `Frontend/lib/api.ts` — all frontend API calls
- `Frontend/context/AuthContext.tsx` — auth state (token, user, login/logout)
- `Frontend/context/SocketContext.tsx` — WebSocket connection and online users
- `Backend/src/controllers/controller.js` — all route handlers
- `Backend/src/routes/routes.js` — route definitions
- `Backend/src/middleware/auth.js` — JWT verification middleware
- `Backend/prisma/schema.prisma` — database schema

## Updating lessons.md

`lessons.md` is a team learning document. It exists so students can review what they need to know before evaluation. When you implement or change something:

1. **Check first** — read `lessons.md` to see if the topic already has a section
2. **Update or add** — if the topic exists, update it. If not, add a new numbered section
3. **Use real code** — snippets should come from the actual codebase, not generic examples. Include file paths
4. **Explain for students** — write as if explaining to a teammate who wasn't present when the code was written. Cover:
   - What this does
   - Why it's needed
   - How it works (brief, with code)
   - Key terms an evaluator might ask about
5. **Verify against the subject** — cross-check any claims about requirements or module criteria against `transcendance.md`
6. **Keep it concise** — each section should be scannable in under 2 minutes

## Project structure

```
Ft_Transcendence/
├── Frontend/          # Next.js app (port 3000)
│   ├── app/           # Pages and layouts (App Router)
│   ├── components/    # UI components (shadcn + custom ft_ components)
│   ├── context/       # AuthContext, SocketContext
│   └── lib/           # API helpers, utilities
├── Backend/           # Express.js API (port 3001)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── middleware/
│   └── prisma/        # Schema and migrations
├── docker-compose.yml
├── .env.example       # Required env vars (copy to .env)
├── transcendance.md   # 42 subject (source of truth)
└── lessons.md         # Team learning log
```

## Frontend style

Read `FRONT_DIRECTIVE.md` before any frontend work. It defines the complete visual identity: brutalist editorial design system, color palette, typography, component library, layout patterns, and anti-patterns. Reference designs are in `examples/react-app.js` and `examples/react-app-2.js`.

## Git commits

- Use short commit messages with a prefix: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`
- Group changes by logical unit, not by file
- Use `git add <specific files>` — never `git add .` or `git add -A`
- Do not add yourself as co-author
- Do not push unless explicitly asked

## Conventions

- Secrets in `.env`, never in code or docker-compose. Update `.env.example` when adding new vars
- Frontend and backend are separate services communicating via REST API and WebSockets
- Custom UI components: `FtInput`, `FtInputLabel`, `FtHighlight` — use these over raw shadcn inputs
- Forms use `noValidate` — all validation is in JavaScript handlers
- Fonts: Inter (sans), Instrument Serif (serif), Geist Mono (mono)
- Light mode by default
- Auth flow: JWT in localStorage, `Authorization: Bearer <token>` header for protected routes
