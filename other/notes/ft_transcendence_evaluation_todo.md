# ft_transcendence Evaluation Todo

Source checklist: `other/notes/ft_transcendence_evaluation_sheet.md`

Official subject: `other/transcendance.md`

Current module audit: `other/modules.md`

Use this file during preparation and during a dry-run evaluation. Mark each item only after it has been demonstrated, not just found in code.

## 0. Stop Conditions

- [ ] All 4-5 team members are available for the full evaluation.
- [ ] Repository is cloned into a clean empty folder.
- [ ] The evaluated repo is the official team repository.
- [ ] No unexpected aliases, shell wrappers, or hidden helper scripts affect commands.
- [ ] Any scripts used for setup or testing have been reviewed by the team.
- [ ] No committed secrets are present.

## 1. README And Team Explanation

- [ ] `README.md` has project name and description.
- [ ] `README.md` lists all team members and roles: PO, PM, Tech Lead, Developers.
- [ ] `README.md` explains project management and team workflow.
- [ ] `README.md` explains the technology choices.
- [ ] `README.md` documents the database schema.
- [ ] `README.md` lists features and who implemented them.
- [ ] `README.md` lists claimed modules, justifications, and point calculation.
- [ ] `README.md` explains each member's individual contributions.
- [ ] Each team member can explain their own role and at least one feature they implemented.
- [ ] At least two team members can explain the whole project concept and architecture.
- [ ] Git history shows meaningful contributions from the team.

Evidence to prepare:

- `README.md`
- `git log --oneline --decorate --graph --all`
- `git shortlog -sn`

## 2. Mandatory Architecture

- [ ] Frontend exists and runs: `frontend/`.
- [ ] Backend exists and runs: `backend/`.
- [ ] Database exists and runs: PostgreSQL from `docker-compose.yml`.
- [ ] A team member can explain how browser requests move through frontend, backend, and database.
- [ ] Socket.io real-time behavior is explained if shown in the demo.

Evidence to prepare:

- `frontend/app/`
- `frontend/lib/api.ts`
- `backend/src/routes/routes.js`
- `backend/src/controllers/controller.js`
- `backend/prisma/schema.prisma`
- `frontend/context/SocketContext.tsx`

## 3. Single Command Deployment

- [ ] Start from a stopped state.
- [ ] Run the official eval startup command from `README.md`.
- [ ] Confirm all services start without manual intervention.
- [ ] Confirm the app is reachable in the browser.
- [ ] Confirm backend healthcheck or API endpoint responds.
- [ ] Confirm migrations are applied automatically or documented clearly.
- [ ] Confirm uploads/data persistence behavior if claimed.

Suggested dry-run commands:

```sh
docker compose down
docker compose up --build
```

Evidence to prepare:

- `docker-compose.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `README.md`

## 4. Browser And Legal Pages

- [ ] Open the app in latest stable Google Chrome.
- [ ] DevTools console has no app errors.
- [ ] Any third-party warnings can be explained.
- [ ] Privacy Policy page is reachable from the app.
- [ ] Terms of Service page is reachable from the app.
- [ ] Both legal pages have relevant, non-placeholder content.

Evidence to prepare:

- Browser demo.
- Routes/components for Privacy Policy and Terms of Service.

## 5. Frontend Requirements

- [ ] Desktop layout is usable.
- [ ] Mobile or tablet layout is usable.
- [ ] Main workflows are clear and accessible.
- [ ] Tailwind CSS and shadcn/ui usage can be shown in code.
- [ ] Forms use JavaScript validation with `noValidate`, matching project convention.
- [ ] User-facing errors are understandable.

Evidence to prepare:

- `frontend/app/`
- `frontend/components/`
- `frontend/tailwind.config.*`
- `frontend/components/ui/`

## 6. Environment And Secrets

- [ ] `.env` files are ignored by Git.
- [ ] `backend/.env.example` exists and is accurate.
- [ ] `frontend/.env.local.example` exists and is accurate.
- [ ] No API keys, JWT secrets, OAuth secrets, database passwords, or tokens are committed.
- [ ] Docker and README setup instructions explain required environment variables.

Suggested dry-run commands:

```sh
git check-ignore backend/.env frontend/.env.local
rg -n "SECRET|TOKEN|PASSWORD|API_KEY|CLIENT_SECRET|DATABASE_URL" .
```

Evidence to prepare:

- `.gitignore`
- `backend/.env.example`
- `frontend/.env.local.example`

## 7. Database Design

- [ ] Prisma schema has clear models and relations.
- [ ] A team member can explain core tables/models.
- [ ] A team member can explain relation fields and why they exist.
- [ ] Migrations are present or schema setup is documented.
- [ ] The app can create/read/update/delete the expected data during demo flows.

Evidence to prepare:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
- `other/lessons/backend/5_Prisma_and_Database_Layer.md`

## 8. Authentication And Input Security

- [ ] Email/password signup works.
- [ ] Email/password login works.
- [ ] Passwords are hashed with bcrypt before storage.
- [ ] JWT auth flow is understood: token in localStorage, `Authorization: Bearer <token>`.
- [ ] Protected backend routes reject missing or invalid tokens.
- [ ] Frontend validates invalid form input.
- [ ] Backend validates invalid form input.
- [ ] Injection and XSS attempts are rejected or safely handled.
- [ ] HTTPS is used for backend communication in the eval deployment.

Evidence to prepare:

- `backend/src/middleware/auth.js`
- `backend/src/controllers/controller.js`
- `frontend/context/AuthContext.tsx`
- `frontend/lib/api.ts`
- `other/lessons/backend/4_Authentication_and_Authorization.md`

## 9. Claimed Module Count

- [ ] Read the module list in `README.md`.
- [ ] Cross-check every claimed module against `other/transcendance.md`.
- [ ] Compare claims with `other/modules.md`.
- [ ] Confirm the claimed total is at least 14 points.
- [ ] Prepare a demo script for each claimed major module.
- [ ] Prepare a demo script for each claimed minor module.
- [ ] Remove or reword any module claim that cannot be demonstrated fully.
- [ ] Final validated module count reaches at least 14 points.

Important rule:

- [ ] Count only working modules. Incomplete or non-functional modules are 0 points.

## 10. Module Demo Matrix

Fill this before evaluation.

| Module | Major/Minor | Points | Subject section | Demo steps | Code evidence | Owner | Status |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| Framework frontend + backend | Major | 2 | IV.1 Web | Show Next.js frontend and Express backend running | `frontend/`, `backend/` | TBD | [ ] |
| User Management | Major | 2 | IV.3 User Management | Signup, login, profile/account flow | `AuthContext.tsx`, `controller.js`, `schema.prisma` | TBD | [ ] |
| Public API | Major | 2 | IV.1 Web | Show secured API docs/key/rate limit/endpoints | TBD | TBD | [ ] |
| User interaction | Major | 2 | IV.6 Gaming and user experience | Show social/user interaction workflow | TBD | TBD | [ ] |
| Real-time features using WebSockets | Major | 2 | IV.1 Web | Show two users with live updates | `SocketContext.tsx`, Socket.io backend setup | TBD | [ ] |
| Prisma ORM | Minor | 1 | IV.1 Web | Explain Prisma schema and database calls | `backend/prisma/schema.prisma` | TBD | [ ] |
| OAuth | Minor | 1 | IV.3 User Management | Show OAuth login flow | TBD | TBD | [ ] |
| 2FA | Minor | 1 | IV.3 User Management | Enable and use 2FA | TBD | TBD | [ ] |
| Design system | Minor | 1 | IV.6 Gaming and user experience | Show reusable shadcn/ui components | `frontend/components/ui/` | TBD | [ ] |
| Advanced search | Minor | 1 | IV.8 Data and Analytics | Search with filters/results | TBD | TBD | [ ] |

Add candidate modules from `other/modules.md` only after they are fully demonstrated.

## 11. Code Quality Review

- [ ] Folder structure is explainable.
- [ ] Main backend route flow is explainable.
- [ ] Main frontend route flow is explainable.
- [ ] Shared API helper usage is explainable.
- [ ] Auth context and protected route behavior are explainable.
- [ ] Socket context and online/live behavior are explainable.
- [ ] No major dead code, broken routes, or obvious duplicated logic blocks are left in demo paths.
- [ ] The team can explain trade-offs and known limitations honestly.

Evidence to prepare:

- `frontend/app/`
- `frontend/context/AuthContext.tsx`
- `frontend/context/SocketContext.tsx`
- `frontend/lib/api.ts`
- `backend/src/routes/routes.js`
- `backend/src/controllers/controller.js`

## 12. Functionality Smoke Test

- [ ] Create user A.
- [ ] Create user B.
- [ ] Login/logout works for both users.
- [ ] User A can use core app features.
- [ ] User B can use core app features.
- [ ] Multi-user behavior works at the same time in two browser sessions.
- [ ] Main error states are handled without app crashes.
- [ ] Refreshing protected pages behaves correctly.
- [ ] Backend restart does not corrupt data.
- [ ] Database data persists across container restart.

## 13. Final Evaluation Decision

- [ ] Mandatory architecture passes.
- [ ] Mandatory deployment passes.
- [ ] Mandatory technical/security requirements pass.
- [ ] Legal pages pass.
- [ ] Team explanation passes.
- [ ] README passes.
- [ ] Validated modules total at least 14 points.
- [ ] Extra modules beyond 14 are counted separately as bonus, maximum 5.
- [ ] Every team member can explain the code they submitted.

Final score notes:

```text
Validated major modules:
Validated minor modules:
Mandatory points total:
Bonus points, max 5:
Known risks:
Last dry run date:
```
