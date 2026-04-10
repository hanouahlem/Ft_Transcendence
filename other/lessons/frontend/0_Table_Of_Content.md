# Frontend Table Of Content

Quick study checklist:

- [ ] I understand how the Next.js App Router is organized in this repo
- [ ] I can explain what `layout.tsx`, `page.tsx`, and client components do
- [ ] I understand how auth state is shared with `AuthContext`
- [ ] I can explain the difference between `AuthProvider`, `useAuth`, and `ProtectedRoute`
- [ ] I know how frontend code talks to the backend through `frontend/lib/api.ts`
- [ ] I can explain how the main pages are structured: login, register, feed, search, friends, profile, notifications, settings
- [ ] I understand how reusable UI components are composed
- [ ] I know which frontend sections are fully wired and which are still mock/demo UI
- [ ] I know which section I still need to review in depth

## 1. Frontend Runtime Architecture

Goal: understand how the frontend app starts and how the top-level tree is built.

- Next.js App Router basics
- role of `frontend/app/layout.tsx`
- global CSS in `frontend/app/globals.css`
- why `AuthProvider` wraps the app
- difference between server components and `"use client"` components

Study file:

- `lessons/frontend/1_Runtime_Architecture.md`

## 2. Pages, Routes, and App Router Basics

Goal: understand how pages map to URLs in this repo.

- `page.tsx` file-based routing
- root pages: `/`, `/login`, `/register`, `/feed`, `/search`, `/friends`, `/notifications`, `/profile`
- nested routes under `/settings/...`
- what each current page is responsible for
- when a page needs to be a client component

Study file:

- `lessons/frontend/2_Pages_Routes_and_App_Router_Basics.md`

## 3. React Context and Authentication State

Goal: understand how login state is stored and shared across the frontend.

- `createContext`, provider, and consumer idea
- `AuthProvider` in `frontend/context/AuthContext.tsx`
- `useAuth()` as a custom hook
- token storage in `localStorage`
- loading the current user from the JWT

Study file:

- `lessons/frontend/3_React_Context_and_Authentication_State.md`

## 4. Protected Pages and Navigation Flow

Goal: understand how the frontend blocks unauthenticated access and moves users around.

- `ProtectedRoute` in `frontend/components/auth/ProtectedRoute.tsx`
- redirect to `/login` when user is not authenticated
- login/logout flow from the frontend point of view
- page-level auth expectations

Study file:

- `lessons/frontend/4_Protected_Pages_and_Navigation_Flow.md`

## 5. Frontend API Layer and Backend Communication

Goal: understand how the frontend sends requests to the backend.

- `frontend/lib/api.ts` as the shared API helper file
- `NEXT_PUBLIC_API_URL`
- `fetch(...)` usage and auth headers
- `ApiResult<T>` pattern: success vs failure
- why some pages still use direct `fetch(...)` instead of the shared helpers

Study file:

- `lessons/frontend/5_API_Layer_and_Backend_Communication.md`

## 6. Auth Screens: Login and Register

Goal: understand the current auth pages and how they connect to the backend.

- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/register/page.tsx`
- form submission flow
- login response -> `AuthContext.login(...)`
- current OAuth UI placeholders on the login page

Study file:

- `lessons/frontend/6_Auth_Screens_Login_and_Register.md`

## 7. Feature Pages and Current Wiring Status

Goal: understand what each major frontend page currently does and how complete it is.

- feed page: posts, likes, comments, uploads
- friends page: user list, search, current integration gaps
- notifications page: real structured notification ledger and deep-link behavior
- profile and settings pages: how the real routed pages map to backend data and mutations
- how to identify frontend drift from backend capabilities

Study file:

- `lessons/frontend/7_Feature_Pages_and_Current_Wiring_Status.md`

## 8. Reusable UI Components and Styling System

Goal: understand how the frontend builds pages from shared pieces.

- layout shell components like `Sidebar`, `RightRail`, and `NatureCanvas`
- shared UI in `frontend/components/ui/`
- utility helpers in `frontend/lib/utils.ts`
- Tailwind usage in this repo
- when a component is business logic vs pure presentation

Study file:

- `lessons/frontend/8_UI_Components_and_Styling_System.md`

## 9. Frontend Dev Workflow and Failure Modes

Goal: understand how to run, debug, and reason about frontend issues confidently.

- local vs Docker frontend run
- common failures:
  - missing env
  - backend unavailable
  - invalid token
  - hydration/client-only issues
  - page wired to mock data instead of real API
- how to inspect whether a bug is frontend-only or backend-related

Study file:

- `lessons/frontend/9_Dev_Workflow_and_Failure_Modes.md`

## Recommended Walkthrough Order

1. Frontend Runtime Architecture
2. Pages, Routes, and App Router Basics
3. React Context and Authentication State
4. Protected Pages and Navigation Flow
5. Frontend API Layer and Backend Communication
6. Auth Screens: Login and Register
7. Feature Pages and Current Wiring Status
8. Reusable UI Components and Styling System
9. Frontend Dev Workflow and Failure Modes

## Notes

- Use this as a study map, not as a full explanation document.
- We create each concept file when we start that section.
- If one section feels unclear, drill into that section before moving on.
- Every explanation should stay consistent with `other/transcendance.md`, which is the project source of truth.
