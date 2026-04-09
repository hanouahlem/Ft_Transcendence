# Refactor Checklist

Purpose:
Track refactor progress, important deviations from the original plan, and verification notes between phases.

Last updated: 2026-04-09

## Current Status

- [x] Phase 1: Lock the target API contract
- [x] Phase 2: Refactor the notification data model
- [x] Phase 3: Move notification creation fully into backend logic
- [x] Phase 4: Clean friends and feed backend behavior
- [x] Phase 5: Update the frontend API layer
- [x] Phase 6: Migrate frontend routing to `/profile`
- [x] Phase 7: Make notifications actionable in the frontend

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

## Phase 4 Notes

- Feed page now supports `All Posts` vs `Friends` and calls `GET /posts` or `GET /posts/friends` accordingly   // [2 vues de feed]
- Shared friend-request hook now uses `PATCH /friends/:id/accept`   // [route explicite]
- Friends page now uses the same explicit accept route
- Friends page removes friendships with the real `friendshipId` instead of the public user id   // [sinon delete peut viser le mauvais id]
- Friends search/list no longer expects public `email` fields from `/users`   // [contrat public respecte]

## Phase 5 Notes

- `frontend/lib/api.ts` now exposes shared helpers for global feed, friends feed, public user lookup by username, structured notifications, and the explicit friend accept route   // [centralisation des appels]
- frontend notification types now match the structured backend payload (`type`, `actor`, `postId`)   // [base pour la future page notifications]
- shared frontend types no longer pretend that public feed/user payloads include `email`   // [alignement avec le backend]

## Phase 6 Notes

- Active profile routing now uses `/profile` and `/profile/[username]` instead of `/profil` and numeric ids   // [urls lisibles]
- `ProfileView` now resolves public profiles through `GET /users/by-username/:username` before loading posts and friends   // [transition vers username]
- Feed, comments, right rail, sidebar, and profile-adjacent links now point to username-based profile URLs   // [navigation coherente]

## Phase 7 Notes

- `/notifications` is the real archive-styled ledger page built from structured backend notifications, replacing the deprecated `content`-based screen   // [vraie page notifications maintenant]
- Notification rows build their text from `type`, actor identity (`displayName` + `username`), and post metadata only; the backend does not generate display copy   // [plus de texte backend, liens utiles]
- Notification cards are fully clickable records without per-card action buttons; header identity links go to the actor profile while the card body opens the notification destination   // [carte cliquable entiere]
- `LIKE` and `COMMENT` deep-links use the connected user profile with `?post=[postId]`, while `MENTION` keeps the actor-profile context for the referenced post   // [logique des liens selon le type]
- Heavy like activity on the same post is grouped into one summary card when a post has more than 5 `LIKE` rows; this aggregation stays frontend-only for the student project   // [regroupement visuel sans changer l'api]
- `ProfileView` opens the matching post dialog when a notification lands on a `?post=[postId]` profile URL   // [click notif ouvre le bon post]
- The notifications right rail owns local search/filter controls and “mark all as read” without reintroducing old Radix-based UI wrappers   // [archive ui propre]

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

- Some pages still use direct `fetch(...)` even though the shared API layer now matches the backend contract   // [migration progressive]
- Deprecated settings sub-routes still exist and still reference the old settings tree   // [cleanup plus tard]

## Next Phase

- Phase 8: clean remaining feed/settings frontend routes and deprecated pages
