# Login Page Example Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the live login page with the new example layout while preserving the existing login request, token handling, redirect flow, and backup page.

**Architecture:** Keep the rewrite local to `frontend/app/login/page.tsx`, compose the page from small presentational components, and preserve integration with `loginUser` and `useAuth()`. Add markdown documentation under `docs/` because `lessons.md` is not present in this workspace.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS, local component helpers, existing auth API/context.

---

### Task 1: Capture the approved implementation context

**Files:**
- Create: `docs/plans/2026-03-24-login-page-design.md`
- Create: `docs/plans/2026-03-24-login-page-implementation.md`

**Step 1: Write the design and plan docs**

Document the approved visual direction, preserved auth behavior, placeholder social buttons, documentation location, and verification path.

**Step 2: Verify the docs exist**

Run: `rg --files docs/plans`
Expected: both plan files are listed

### Task 2: Replace the live login page

**Files:**
- Modify: `frontend/app/login/page.tsx`
- Keep unchanged: `frontend/app/login/page.backup.tsx`

**Step 1: Define the page composition**

Split the page into readable local components:

- SVG defs
- animated canvas background
- archive side panel
- paper card header
- framed field input
- social placeholder button
- stamp submit button

**Step 2: Preserve the auth flow**

Keep:

- `isAuthLoading` and `isLoggedIn` redirect handling
- `loginUser({ email, password })`
- `await login(result.data.token)`
- error state and loading state

**Step 3: Rebuild the layout**

Implement the example’s:

- canvas grid/paper background
- overlapping paper and green archive panels on desktop
- stacked mobile layout
- tape strips, wax seal, beads, stitched lines, stamp button
- footer metadata and register link

**Step 4: Keep placeholder actions explicit**

Social buttons should stay visible and clickable, but must not claim real sign-in behavior yet.

### Task 3: Add teammate-facing documentation

**Files:**
- Create: `docs/login-page-example.md`

**Step 1: Document what changed**

Explain:

- what the new layout is
- which components are responsible for each visual piece
- where the real auth flow happens
- what remains placeholder-only for future work

**Step 2: Document how to extend it**

Cover where to wire real social auth or lost-password behavior later without rewriting the page structure.

### Task 4: Verify and review

**Files:**
- Verify: `frontend/package.json`
- Review: `frontend/app/login/page.tsx`
- Review: `docs/login-page-example.md`

**Step 1: Run lint**

Run: `npm run lint`
Workdir: `frontend`
Expected: lint passes

**Step 2: Run build**

Run: `npm run build`
Workdir: `frontend`
Expected: build passes, or a concrete environment error is captured

**Step 3: Review diff**

Run: `git diff -- frontend/app/login/page.tsx docs/plans/2026-03-24-login-page-design.md docs/plans/2026-03-24-login-page-implementation.md docs/login-page-example.md`
Expected: only the planned login-page and documentation changes are present
