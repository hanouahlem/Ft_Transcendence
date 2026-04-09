# Refactor Checklist

Purpose:
Track refactor progress, important deviations from the original plan, and verification notes between phases.

Last updated: 2026-04-09

## Current Status

- [x] Phase 1: Lock the target API contract
- [x] Phase 2: Refactor the notification data model
- [x] Phase 3: Move notification creation fully into backend logic
- [ ] Phase 4: Clean friends and feed backend behavior
- [ ] Phase 5: Update the frontend API layer
- [ ] Phase 6: Migrate frontend routing to `/profile`
- [ ] Phase 7: Make notifications actionable in the frontend

## Phase 1 Notes

- Added `GET /users/by-username/:username`  // [on peut chercher par username maintenant]
- Added `GET /posts/friends`  // [fetch les posts des amis seulement (pour le feed)]
- Changed friend accept route to `PATCH /friends/:id/accept`  // [plus clair]
- Removed the duplicate `POST /posts/:id/comments` route and kept the non-upload version    // [y'avait 2 fois cette route]
- Stopped exposing `email` in public user payloads and feed/profile author payloads   // [faut pas exposer les email des users]
- `POST /notifications` was intentionally kept after plan review

## Phase 2 Notes

- `Notification` now stores structured fields: // [on stocke des infos dans la notification pour reutiliser plus tard]
  - `type`
  - `userId`
  - `actorId`
  - optional `postId`
- Added notification recipient/actor relations on `User`     //
- Added notification relation on `Post`                     //  [on doit ajouter ca a cause du truc d'avant]
- Added `backend/src/services/notificationService.js`
- `notifController` now returns actor/post-aware structured notification payloads only   // [plus de texte genere par le backend]
- Friend request creation now writes a structured `FOLLOW` notification

## Phase 3 Notes

- `POST /notifications` was kept as a route but restricted so normal clients cannot forge notification rows anymore   // [les gens doivent pas pouvoir creer des notifs]
- `friend.acceptFriend()` now creates a structured `FOLLOW_ACCEPT` notification for the original sender
- `post.likePostHandler()` now creates a `LIKE` notification only when a new like row is inserted
- `post.createCommentHandler()` now creates a `COMMENT` notification for the post owner
- shared helper logic now skips self-notifications automatically

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
- Deprecated notifications page is intentionally unsupported now that the backend returns structured payloads only   // [ancienne page a refaire]
- Profile route migration to `/profile/[username]` has not started yet

## Next Phase

- Phase 4: clean friends and feed behavior around accepted-friends feed and explicit friend actions
