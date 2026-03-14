# Claude Code — ft_transcendence

## Project context

This is a **42 school group project** (4-5 students). The goal is to build a full-stack web application that earns at least **14 module points**. Team members must be able to explain every part of the codebase during evaluation — code they can't explain = failed project.

The project subject is at `transcendance.md` in the repo root. This is the **ultimate source of truth** for all requirements, module definitions, and evaluation criteria.

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

## lessons.md

`lessons.md` is a living document that logs what the team needs to understand to pass evaluation. When you teach or implement something new:

1. Check if the concept is already covered in `lessons.md`
2. If not, add a new section explaining the **what**, **why**, and **how** in plain language
3. Include short code snippets from the actual codebase — not generic examples
4. Keep explanations concise. The audience is students who need to explain this to evaluators, not beginners reading a textbook
5. Always verify claims against `transcendance.md` before writing

## Rules

- Never add features or modules without checking `transcendance.md` for the exact requirements
- Secrets go in `.env`, never hardcoded. Update `.env.example` when adding new variables
- The backend and frontend are separate services — don't mix them
- Use the existing custom components (`FtInput`, `FtInputLabel`, `FtHighlight`) instead of raw shadcn inputs
- All forms use `noValidate` on the `<form>` tag — validation is handled in JavaScript
- Fonts: Inter (sans), Instrument Serif (serif), Geist Mono (mono)
- Default to light mode
