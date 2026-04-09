# Refactor Checklist

Purpose:
Track refactor progress, important deviations from the original plan, and verification notes between phases.

Last updated: 2026-04-09

## Current Status

- [x] Phase 1: Lock the target API contract
- [x] Phase 2: Refactor the notification data model
- [ ] Phase 3: Move notification creation fully into backend logic
- [ ] Phase 4: Clean friends and feed backend behavior
- [ ] Phase 5: Update the frontend API layer
- [ ] Phase 6: Migrate frontend routing to `/profile`
- [ ] Phase 7: Make notifications actionable in the frontend

## Phase 1 Notes

- Added `GET /users/by-username/:username`
- Added `GET /posts/friends`
- Changed friend accept route to `PATCH /friends/:id/accept`
- Removed the duplicate `POST /posts/:id/comments` route and kept the non-upload version
- Stopped exposing `email` in public user payloads and feed/profile author payloads
- `POST /notifications` was intentionally kept after plan review

## Phase 2 Notes

- `Notification` now stores structured fields:
  - `type`
  - `userId`
  - `actorId`
  - optional `postId`
- Added notification recipient/actor relations on `User`
- Added notification relation on `Post`
- Added `backend/src/services/notificationService.js`
- `notifController` now returns actor/post-aware notification payloads and derives display `content` server-side for compatibility with the current frontend
- Friend request creation now writes a structured `FOLLOW` notification

## Migration Notes

- Added migration: `backend/prisma/migrations/20260409_structured_notifications/migration.sql`
- Existing notification rows are backfilled with:
  - `type = "MESSAGE"`
  - `actorId = userId`
- Prisma 7 in this repo reads DB connection config from `backend/prisma.config.ts`, so `schema.prisma` must not define `url = env("DATABASE_URL")`

## Verification Notes

- `node --check` passed on modified notification/backend files
- `npx prisma validate` passed inside the backend container
- `npx prisma migrate deploy` applied `20260409_structured_notifications`
- `npx prisma generate` completed successfully inside the backend container
- Backend startup crash from missing `getFriendsPostsHandler` export was fixed after Phase 2

## Current Compatibility Gaps

- Frontend still uses old friend accept calls and still needs the Phase 5 API adapter pass
- Notifications page still renders the derived `content` string instead of using `type`/`actor` directly
- Profile route migration to `/profile/[username]` has not started yet

## Next Phase

- Phase 3: move notification creation fully into backend event logic for friend accept, likes, and comments
