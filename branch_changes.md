# Branch `login` — Changes Summary

## Overview

This branch introduces **authenticated route redirection** and **replaces the old design example files** with new ones matching the current visual direction.

It also now contains a **real login-page redesign in `frontend/app/login/page.tsx`** and a **backend login behavior change** to support username-or-email authentication. That backend part is important to call out separately because this branch is no longer frontend-only.

---

## 1. Authenticated User Redirect (Public Pages → `/feed`)

**Problem:** When a user was already logged in, they could still visit the landing page (`/`), login page (`/login`), and register page (`/register`). There was no mechanism to redirect them away from these public-only pages.

**Solution:** All three public pages now check if the user is authenticated and automatically redirect to `/feed`.

### Files Modified

### `frontend/app/page.tsx` (Landing Page `/`)
- Converted from a **server component** to a **client component** (`"use client"` added) so it can access auth state.
- Added `useAuth()` hook to read `isLoggedIn` and `isAuthLoading`.
- Added a `useEffect` that calls `router.replace("/feed")` when the user is logged in.
- Returns `null` (blank screen) while auth is loading or redirect is in progress, to prevent a flash of the landing page.
- Removed unused `Badge` import.

### `frontend/app/login/page.tsx` (Login Page)
- Added `isLoggedIn` and `isAuthLoading` from `useAuth()` (previously only used `login`).
- Added `useEffect` import.
- Added a `useEffect` that redirects already-logged-in users to `/feed` on page load.
- Returns `null` while auth is loading or redirect is in progress.
- **Changed post-login redirect** from `/profil` to `/feed` — after a successful login, the user now lands on `/feed` instead of `/profil`.

### `frontend/app/register/page.tsx` (Register Page)
- Added `useRouter`, `useEffect`, and `useAuth` imports (none of these were used before).
- Added the same auth-check-and-redirect pattern: if logged in, redirect to `/feed`.
- Returns `null` while auth is loading or redirect is in progress.

### `frontend/components/layout/Navbar.tsx` (Navigation Bar)
- The "Home" link now points to **`/feed`** when the user is logged in, and **`/`** when logged out.
- The active-state highlighting (`navLinkClass`) also switches between `/feed` and `/` accordingly.
- Previously it always pointed to `/`.

### How the redirect works (same pattern in all 3 pages)

```tsx
const { isLoggedIn, isAuthLoading } = useAuth();

useEffect(() => {
  if (!isAuthLoading && isLoggedIn) {
    router.replace("/feed");
  }
}, [isLoggedIn, isAuthLoading, router]);

if (isAuthLoading || isLoggedIn) {
  return null;
}
```

- `isAuthLoading` is true while the app checks localStorage for an existing token on mount.
- Once loading finishes, if `isLoggedIn` is true, `router.replace()` redirects (replace, not push, so the user can't press back to return to the public page).
- While waiting, the component renders nothing (`null`) to avoid a flash of content.

---

## 2. Example Files Replaced

Old React example/prototype files were **deleted** and replaced with new ones that match the current "soft journal" visual direction of the app.

### Deleted (1,859 lines removed)
| File | Lines | Description |
|------|-------|-------------|
| `other/examples/auth_example.js` | 550 | Old auth UI prototype (brutalist/industrial style with neon green accents) |
| `other/examples/feed_example.js` | 597 | Old feed UI prototype (hash-pattern background, angular design) |
| `other/examples/react-app.js` | 409 | Old app prototype v1 (gray/green industrial aesthetic) |
| `other/examples/react-app-2.js` | 303 | Old app prototype v2 (same industrial aesthetic) |

### Added (2,362 lines added)
| File | Lines | Description |
|------|-------|-------------|
| `other/examples/login.js` | 857 | New login page example — warm journal/notebook style with dotted background, stitch lines, book-spine aesthetic |
| `other/examples/feed.js` | 946 | New feed page example — torn-edge paper style, lined-paper backgrounds, vertical thread accents |
| `other/examples/profile.js` | 559 | New profile page example — specimen-case style, tape decorations, handwritten font accents |

All new examples use the same warm palette (`#F5F2EB` background, `#E8E1D5` dots) and share the "soft journal / scrapbook" visual language that the current app (`frontend/`) follows.

---

## 3. Live Login Page Redesign (`frontend/app/login/page.tsx`)

The branch no longer only updates example files. The real login route was redesigned to match the new notebook / archive aesthetic.

### What changed

- Rebuilt the live login page using a cleaner component-based structure inside `frontend/app/login/page.tsx`
- Added a grouped `LOGIN_LAYOUT` config near the top of the file so the main layout values can be tuned from one place
- Matched the example more closely for:
  - archive-green right panel placement
  - paper-card overlap
  - stamp button placement
  - left-side beads
  - signup strip placement
- Kept the backup page untouched: `frontend/app/login/page.backup.tsx`
- Removed the temporary particle background experiment
- Removed the bottom-right bead cluster so the composition stays cleaner

### Internal page helpers now used

- `SvgDefinitions`
- `ArchivePanel`
- `PaperCard`
- `FieldInput`
- `SocialProviderButton`
- `StampSubmitButton`
- `MonoText`
- `Bead`

### Important behavior preserved

- Already authenticated users are still redirected away from `/login` to `/feed`
- Successful login still stores the token through `AuthContext`
- Placeholder social buttons are still visual-only

### Files involved

- `frontend/app/login/page.tsx`
- `docs/login-page-example.md`
- `docs/plans/2026-03-24-login-page-design.md`
- `docs/plans/2026-03-24-login-page-implementation.md`

---

## 4. Backend Login Change (Important Cross-Layer Update)

**Important:** this branch now includes a backend authentication change, not just UI work.

The login form label already suggested "username / email", but the backend was still authenticating by **email only**. To make the real page behavior match the UI, the login flow was extended so users can authenticate with **either username or email**.

### Backend change

#### `backend/src/controllers/userController.js`

- `POST /login` now reads a flexible login identifier (`identifier`, with fallback support for the old `email` field)
- The user lookup now checks:
  - `email === identifier`
  - `username === identifier`
- Login errors now say `Username/email or password is incorrect.`
- Added a `400` response when login credentials are missing

### Frontend/API alignment

#### `frontend/lib/api.ts`

- `LoginData` now supports `identifier + password`
- Backward compatibility with the older `email + password` shape is still preserved in the type for now

#### `frontend/app/login/page.tsx`

- The login input state was renamed from `email` to `identifier`
- The page now sends `loginUser({ identifier, password })`

### Why this should be emphasized

This is a **real backend behavior change** in the branch, not just documentation or wording cleanup. Anyone reviewing ownership or splitting work between teammates should note that this branch now touches:

- frontend presentation
- frontend API contract
- backend authentication logic

If the backend login logic belongs primarily to another teammate's area, this cross-layer change should be made explicit during handoff and in any contribution breakdown.
