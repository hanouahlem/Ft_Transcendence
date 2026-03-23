# Missing Lessons

This file preserves useful content from the old root `lessons.md` that does not belong to the backend lesson track.

These topics should later be moved into dedicated lesson folders such as `lessons/frontend/` or `lessons/realtime/`.

## Frontend Auth Concepts

Useful frontend-side auth ideas documented in the old file:

- `localStorage` stores the JWT on the client so the user stays logged in across refreshes
- the frontend sends `Authorization: Bearer <token>` on protected API calls
- why the project uses JWT in `localStorage` instead of cookies

These do not belong purely to backend lessons because they are about browser-side auth state and client behavior.

## React Concepts

Frontend React basics from the old file:

- `useState`
- `useEffect`
- `useContext`
- `"use client"` in Next.js

These should become frontend study material.

## Form Handling

Frontend form concepts from the old file:

- `e.preventDefault()`
- `try/catch/finally` around API calls
- loading state and error state handling

These are frontend interaction patterns, not backend lessons.

## Socket.io / Realtime

The old file had a full section about:

- HTTP vs WebSocket
- Socket.io server/client setup
- handshake auth with JWT
- user rooms
- online user tracking

This is important project knowledge, but it is not covered by the current backend lesson set.

This should likely become its own study track, for example:

- `lessons/realtime/`

or be added later as an extra backend lesson if realtime remains part of the backend evaluation focus.

## Next.js Route Groups

The old file documented:

- `(auth)` route group
- `(main)` route group
- nested layouts in the App Router

This belongs to frontend / Next.js lessons, not backend lessons.

## Theming

The old file documented:

- CSS custom properties
- light/dark theme variables
- `next-themes`
- `ThemeProvider`

This is frontend UI architecture and should live in frontend lessons.

## Component Library

The old file documented:

- shadcn/ui
- Radix UI primitives
- custom `FtInput`
- custom `FtInputLabel`
- custom `FtHighlight`

This is design system / frontend component knowledge and should also live in frontend lessons.
