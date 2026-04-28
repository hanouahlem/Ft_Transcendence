# 1. Frontend Runtime Architecture

Goal: understand how the frontend app starts and what the top-level structure does before any page is rendered.

## What "Runtime Architecture" Means Here

For the frontend, runtime architecture means:

- what file Next.js starts from
- what wraps the whole app
- where global CSS is loaded
- where global auth state is attached
- what must happen before normal pages can render safely

This is the frontend side of the app lifecycle.

## The Root Layout

The most important top-level file is:

- `frontend/app/layout.tsx`

Real code:

```tsx
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-neutral-950 text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

This file does several important things:

- loads global CSS with `./globals.css`
- defines the HTML and body wrapper for the whole app
- loads the Geist font
- wraps the app in `AuthProvider`

So every page in `frontend/app/` is rendered inside this layout.

## Why `layout.tsx` Matters

In the App Router, `layout.tsx` is not just a visual layout file.

It is the shared wrapper around routes in that part of the tree.

In this repo, that means:

- global styling starts here
- global auth context starts here
- all pages rendered under `frontend/app/` inherit this structure

If `AuthProvider` was not placed here, auth state would not be available across the full app.

## Protected App Shell And Responsive Legal Links

Logged-in routes are wrapped by:

- `frontend/app/(app)/layout.tsx`
- `frontend/components/layout/AppSidebarShell.tsx`

Real code:

```tsx
<AppSidebarShell>{children}</AppSidebarShell>
```

`AppSidebarShell` owns shared UI that should appear around protected pages: the sidebar, mobile bottom navigation, live inbox toasts, post composer, and the responsive legal footer.

Real code:

```tsx
{!isMessagePage ? (
  <footer className="... xl:hidden">
    <Link href="/terms">{t("rightRail.footerLinks.terms")}</Link>
    <span aria-hidden="true">·</span>
    <Link href="/privacy">{t("rightRail.footerLinks.privacy")}</Link>
  </footer>
) : null}
```

This footer is hidden on `xl` screens because the same links already appear in `frontend/components/layout/RightRail.tsx`. Below `xl`, the right rail is hidden, so the shell renders the links at the bottom of the page instead.

## Global CSS

The root layout imports:

```tsx
import "./globals.css";
```

That file is:

- `frontend/app/globals.css`

At the top it imports the styling layers used by the project:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
```

So `globals.css` is where the shared styling system begins.

It also defines:

- theme variables
- color tokens
- radius tokens
- base styles

This means page components do not need to define the whole design system themselves.

## Why `AuthProvider` Is At The Top

The root layout wraps all child pages with:

```tsx
<AuthProvider>
  {children}
</AuthProvider>
```

That matters because many pages need auth data:

- homepage redirects if already logged in
- login/register pages redirect if already logged in
- feed and other pages need the current user
- protected pages need to know whether auth is still loading

Putting `AuthProvider` in the root layout makes auth state available everywhere below it.

## Server Components vs Client Components

By default, App Router files are server components unless they use:

```tsx
"use client";
```

You can see this in many page files, for example:

- `frontend/app/page.tsx`
- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/register/page.tsx`

They need `"use client"` because they use browser-only React features such as:

- `useState`
- `useEffect`
- `useRouter`
- `localStorage` indirectly through auth logic

So a quick rule is:

- if the component needs browser interactivity or React client hooks, it must be a client component

## The App Starts With Auth Bootstrap

Because `AuthProvider` is mounted at the top, the app starts by restoring auth state.

That means:

1. check `localStorage` for a saved token
2. if a token exists, ask the backend for the current user
3. update shared auth state

This is why many pages wait for `isAuthLoading` before deciding what to render.

So one part of the frontend runtime architecture is:

```text
layout mounts
AuthProvider mounts
auth state is restored
pages consume auth state
```

## Example: Homepage Runtime Behavior

The homepage in `frontend/app/page.tsx` does this:

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

This shows an important runtime rule:

- pages often wait for global auth state before choosing their UI

So the top-level runtime architecture directly affects page behavior.

## Main Frontend Tree In This Repo

At a high level, the frontend structure is:

```text
frontend/app/layout.tsx
  -> imports globals.css
  -> wraps app in AuthProvider
  -> renders route pages as children
```

Then route files inside `frontend/app/` provide the page content.

Examples:

- `frontend/app/page.tsx`
- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/register/page.tsx`
- `frontend/app/feed/page.tsx`
- `frontend/app/friends/page.tsx`

## Why This Structure Is Good For The Project

This structure keeps concerns separated:

- `layout.tsx` = top-level app shell
- `globals.css` = shared styles and theme tokens
- `AuthContext.tsx` = global auth state
- page files = route-specific UI and logic

That makes the code easier to explain during evaluation because each file has a clear job.

## Key Terms

- App Router: Next.js routing system based on the `app/` folder
- root layout: the shared wrapper for the whole application tree
- client component: a component that runs in the browser and can use client React hooks
- global CSS: styles loaded once for the whole app
- auth bootstrap: restoring login state when the app starts

## Mental Model To Remember

Think of the frontend startup like this:

```text
Next.js loads layout.tsx
layout loads global CSS
layout wraps children with AuthProvider
AuthProvider restores auth state
page renders with shared auth + shared styles available
```

## Self-Check Questions

- What is the role of `frontend/app/layout.tsx` in this repo?
- Why is `AuthProvider` placed in the root layout?
- Why do some pages need `"use client"`?
- What does `globals.css` provide to the whole app?
- Why do some pages wait for auth loading before rendering?

## Related Next Step

To understand how route files inside `frontend/app/` map to real URLs, read:

- `lessons/frontend/2_Pages_Routes_and_App_Router_Basics.md`
