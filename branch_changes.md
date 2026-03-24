# Branch `login` — Changes Summary

## Overview

This branch introduces **authenticated route redirection** and **replaces the old design example files** with new ones matching the current visual direction.

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

