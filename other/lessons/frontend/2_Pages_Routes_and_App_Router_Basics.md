# 2. Pages, Routes, and App Router Basics

Goal: understand how files inside `frontend/app/` become frontend routes in this repo.

## Core Rule

With the Next.js App Router, folders and files inside `frontend/app/` define routes.

The most common file is:

- `page.tsx`

That file becomes the page shown at a URL.

Simple rule:

```text
app/folder/page.tsx -> /folder
app/page.tsx -> /
```

## Real Routes In This Repo

Current route files include:

```text
frontend/app/page.tsx
frontend/app/(auth)/login/page.tsx
frontend/app/(auth)/register/page.tsx
frontend/app/feed/page.tsx
frontend/app/friends/page.tsx
frontend/app/notifications/page.tsx
frontend/app/profile/page.tsx
frontend/app/profile/[username]/page.tsx
frontend/app/settings/page.tsx
```

That means the current frontend URLs are:

- `/`
- `/login`
- `/register`
- `/feed`
- `/friends`
- `/notifications`
- `/profile`
- `/profile/:username`
- `/settings`

## The Homepage Route

This file:

- `frontend/app/page.tsx`

maps to:

- `/`

In this repo, the homepage is not only a landing page. It also checks auth state:

```tsx
const { isLoggedIn, isAuthLoading } = useAuth();

useEffect(() => {
  if (!isAuthLoading && isLoggedIn) {
    router.replace("/feed");
  }
}, [isLoggedIn, isAuthLoading, router]);
```

So `/` behaves like:

- landing page for logged-out users
- redirect page for already logged-in users

## Auth Routes

These files:

- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/register/page.tsx`

map to:

- `/login`
- `/register`

They are public auth screens.

Both pages use `useAuth()` to avoid showing the form to already logged-in users.

That is why route files are not just "HTML pages". They can contain route-specific logic too.

## Protected Feature Routes

Several pages are intended for logged-in users:

- `frontend/app/feed/page.tsx`
- `frontend/app/friends/page.tsx`
- `frontend/app/notifications/page.tsx`
- `frontend/app/profile/page.tsx`
- `frontend/app/profile/[username]/page.tsx`

These pages usually wrap their content with `ProtectedRoute`.

So the file-based route gives the URL, but access control is still handled by React logic inside the page tree.

## Nested Routes

Nested folders create nested URLs.

Example:

- `frontend/app/profile/[username]/page.tsx` -> `/profile/:username`
- `frontend/app/settings/page.tsx` -> `/settings`

This is one of the main benefits of the App Router: the folder structure already shows the URL structure.

## Why `page.tsx` Matters

In the App Router, `page.tsx` is the entry file for a route segment.

So when someone visits `/friends`, Next.js renders:

- `frontend/app/friends/page.tsx`

When someone visits `/settings`, Next.js renders:

- `frontend/app/settings/page.tsx`

This is the core routing convention to remember.

## Why Many Pages Use `"use client"`

Many page files in this repo begin with:

```tsx
"use client";
```

That happens because these pages use browser/client-only features such as:

- `useState`
- `useEffect`
- `useRouter`
- auth hooks
- direct interactivity

Examples:

- login form logic
- redirect logic
- local state for forms
- fetch actions triggered by the user

So in this project, many route files are client pages because the app is interactive and auth-aware.

## Route Files vs Shared Components

A route file is the page entry point.

A shared component is reused by multiple routes.

Examples in this repo:

- route files:
  - `frontend/app/feed/page.tsx`
  - `frontend/app/(auth)/login/page.tsx`
- shared components:
  - `frontend/components/layout/AppSidebarShell.tsx`
  - `frontend/components/auth/ProtectedRoute.tsx`
  - files in `frontend/components/ui/`

This distinction matters:

- route file = URL endpoint in the frontend
- component = reusable building block

## App Router Does Not Replace Logic

The App Router decides which page file matches a URL.

But the page itself still decides:

- whether to redirect
- whether to fetch data
- whether to show loading
- whether to show protected content

So routing gives the path, but the page component still contains behavior.

## Current Routing Reality In This Repo

In this repo, a route tells you where the page lives, but not how much real backend behavior is wired into it yet.

Examples:

- `/feed` is connected to real backend post routes and can switch between the global feed and the accepted-friends feed
- `/profile` and `/profile/:username` read profile-related backend data:
  - `GET /user` for the authenticated user route or `GET /users/by-username/:username` for a public profile
  - `GET /users/:id/posts`
  - `GET /users/:id/friends`
- `/friends` has real backend wiring for requests, acceptance, and removal through friendship ids
- `/notifications` now uses real backend notification rows and builds navigation targets from `type`, `actor.username`, and `postId`
- `/settings` is the single active account route and owns profile edits, media uploads, and password updates

So route knowledge is only the first layer. You also need to know whether a page is backed by real API calls, partial wiring, or placeholder UI.

## Key Terms

- route: a URL handled by the frontend
- App Router: Next.js routing system based on the `app/` folder
- route segment: one folder level in the route tree
- nested route: a route created by folders inside folders
- page component: the component exported from `page.tsx`

## Mental Model To Remember

Think of the router like this:

```text
folder structure defines URL structure
page.tsx defines the route entry file
layout.tsx wraps the route tree
shared components are reused inside pages
```

## Self-Check Questions

- Which file maps to the `/friends` route?
- Why does `frontend/app/page.tsx` map to `/`?
- What URL does `frontend/app/settings/page.tsx` create?
- What is the difference between a route file and a shared component?
- Why do many route files in this repo use `"use client"`?

## Related Next Step

To understand how auth data is shared across these pages, read:

- `lessons/frontend/3_React_Context_and_Authentication_State.md`
