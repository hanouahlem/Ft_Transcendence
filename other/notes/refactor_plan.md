# Refactor Plan

This plan consolidates:
- `other/api_notes.md`
- `other/frontend_notes.md`
- `other/notif_notes.md`

It is ordered by dependency so structural backend changes happen first, then frontend integration, then cleanup and documentation.

It is aligned with the 42 subject requirements in `other/transcendance.md`, especially:
- profile system
- friends system
- posts / comments / likes
- complete notification system

## Main Priorities

1. Fix the notification system because it is structurally incomplete and directly tied to a subject requirement.
2. Clean the API contract before doing broad frontend refactors.
3. Make the friends accept action explicit.
4. Move profile routing to username-based URLs only after backend support exists.
5. Keep scope tight: no unrelated redesigns, no optional pagination work unless the main refactor is stable.

## Phase 1: Lock The Target API Contract

Goal:
Define the final route and payload shape before editing multiple frontend pages.

### Work

- Use `GET /posts` as the global/explore feed.
- Add `GET /posts/friends` as the home feed for accepted friends only.
- Keep `GET /users/:id/posts` as the profile-posts endpoint during the username-route transition.
- Add an explicit username lookup route:
  - recommended: `GET /users/by-username/:username`
- Stop exposing `email` in public user routes:
  - `GET /users`
  - `GET /users/:id` or equivalent public profile route
- Return `email` only on private account routes such as the authenticated self route.
- Remove public `POST /notifications`.
- Remove the duplicate `POST /posts/:id/comments` route and keep only the non-upload version.

### Friend Route Direction

- Change `PUT /friends/:id` to `PATCH /friends/:id/accept`
- Document that `:id` is the `Friends` table row id

### Acceptance Criteria

- One clear backend contract exists for feeds, friends, notifications, and public profile lookup.
- No duplicate route declarations remain.
- Public profile payloads no longer expose email.

## Phase 2: Refactor The Notification Data Model

Goal:
Replace string-based notifications with structured event data the frontend can render and link from.

### Work

Update `backend/prisma/schema.prisma` so `Notification` no longer stores only freeform `content`.

Target structure:

```prisma
model Notification {
  id        Int      @id @default(autoincrement())
  type      String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation("notificationRecipient", fields: [userId], references: [id])
  userId    Int

  actor     User     @relation("notificationActor", fields: [actorId], references: [id])
  actorId   Int

  post      Post?    @relation(fields: [postId], references: [id])
  postId    Int?
}
```

Also update related `User` relation fields to support both recipient and actor relations cleanly.

### Notification Types

- `FOLLOW`
- `UNFOLLOW`
- `FOLLOW_ACCEPT`
- `LIKE`
- `COMMENT`
- `MENTION`
- `MESSAGE`

`MENTION` and `MESSAGE` can exist in the model even if not fully implemented yet.

### Acceptance Criteria

- Prisma schema supports structured notifications.
- Migration runs successfully.
- Notification rows can identify recipient, actor, and optional post.

## Phase 3: Move Notification Creation Fully Into Backend Logic

Goal:
Ensure notifications reflect real application events and are never client-forged.

### Work

- Remove or restrict `POST /notifications`.
- Create notifications internally in controllers for:
  - friend/follow request sent
  - friend/follow request accepted
  - unfriend/unfollow if this event is kept
  - post like
  - comment creation
- Skip creating a notification when the actor and recipient are the same user.
- Standardize helper logic if notification creation is repeated across controllers.

### Backend Response Shape

When returning notifications, include actor data needed by the frontend:

- `actor.id`
- `actor.username`
- `actor.avatar`
- `postId`
- `type`
- `read`
- `createdAt`

The frontend should not need an extra request to build links.

### Acceptance Criteria

- Notifications are only created by backend event logic.
- Like/comment/friend actions generate structured notifications.
- Notification list responses contain enough data to render and navigate.

## Phase 4: Clean Friends And Feed Backend Behavior

Goal:
Make social actions explicit and make the feed match expected product behavior.

### Work

- Use `GET /posts` for the global feed.
- Add `GET /posts/friends`.
- Filter this feed to accepted friendships only.
- Keep `GET /users/:id/posts` as the profile-posts endpoint during this refactor.
- Update the accept route to `PATCH /friends/:id/accept`.

### Notes

This phase should happen after notification refactor because friend actions and post actions now create notification events and should use the final model from the start.

### Acceptance Criteria

- Global feed and friends feed are separate.
- Friend acceptance is explicit through `PATCH /friends/:id/accept`.
- Backend friend and feed routes match the contract defined in Phase 1.

## Phase 5: Update The Frontend API Layer

Goal:
Change all network helpers in one place before touching page-level UI.

### Work

Update `frontend/lib/api.ts` to:
- use the new route names
- add helpers for `GET /posts/friends`
- add helpers for username-based profile lookup
- update notification types/interfaces
- update friend action helpers to match the new accept route

### Notes

This phase should be a strict adapter pass. Do not mix it with UI redesign.

### Acceptance Criteria

- Page components can switch to the new backend contract through `frontend/lib/api.ts`.
- Notification data is typed enough for action-based rendering.

## Phase 6: Migrate Frontend Routing To `/profile`

Goal:
Make profile URLs consistent and human-readable.

### Work

- Rename `/profil` to `/profile`.
- Change `/profil/[id]` to `/profile/[username]`.
- Update internal links across:
  - feed
  - friends
  - notifications
  - settings references
  - any user card / avatar / mention links
- Add backend support first so the page can resolve a user by username.

### Constraints

- Old links breaking after a username change is acceptable for this project.
- Do not start this phase until username lookup is supported and stable.

### Acceptance Criteria

- No active navigation still points to `/profil`.
- Public profile URLs are username-based.

## Phase 7: Make Notifications Actionable In The Frontend

Goal:
Turn notifications from static text rows into useful navigation entries.

### Work

Update the notifications page so each row is rendered from:
- notification `type`
- `actor.username`
- optional `postId`

Link rules:
- profile-related notifications link to `/profile/[actorUsername]`
- post-related notifications link to `/profile/[actorUsername]?post=[postId]`

The frontend should build the display text dynamically instead of trusting a stored backend sentence.

### Profile Deep-Link Support

Update the profile page so it:
- reads `?post=...` from the query string
- finds that post in the loaded profile posts
- opens the existing post dialog automatically

### Acceptance Criteria

- Notifications can be clicked and navigate somewhere meaningful.
- Post-related notifications can open or target the relevant post from the profile page.

## Phase 8: Feed And Settings Frontend Cleanup

Goal:
Align the frontend route tree with the new backend behavior and remove dead pages.

### Work

- Add two feed tabs on `/feed`:
  - `All`
  - `Friends`
- Make each tab call the matching backend endpoint.
- Remove deprecated settings sub-routes:
  - `/settings/security`
  - `/settings/notifications`
  - `/settings/profile`
- Remove the corresponding old folders under `frontend/app/(app)/settings/` if they still exist.

### Acceptance Criteria

- Feed supports both all-posts and friends-only views.
- Deprecated settings routes are removed and no longer linked anywhere.

## Phase 9: Regression Testing

Goal:
Verify the refactor works as a connected system rather than as isolated file edits.

### Test Flows

- Register/login still work.
- Current user route still returns private account fields like email only for self.
- Public user/profile routes do not expose email.
- Send friend request -> request appears -> accept request -> friendship exists -> notification appears.
- Remove pending request behaves differently from removing an accepted friend.
- Create post -> like post -> recipient receives LIKE notification.
- Create post -> comment post -> recipient receives COMMENT notification.
- Notifications page links to the correct profile.
- Post-related notification opens the correct post from profile when `?post=` is present.
- `/feed` can switch between global and friends feed.
- No route still references `/profil`.

### Acceptance Criteria

- Core social flows pass manually from frontend to database.
- No broken links remain in the migrated route tree.

## Phase 10: Update Team Lessons

Goal:
Keep `other/lessons/` usable for evaluation prep after the refactor.

### Work

For each implemented topic:
- read the relevant lesson file first
- update an existing section or add a new numbered section
- use real code snippets from the project
- explain:
  - what it does
  - why it exists
  - how it works
  - what key terms an evaluator may ask about

Minimum lesson topics to update:
- notification model and structured event fields
- internal notification creation
- same-table friends model and `status`-based route semantics
- global feed vs friends feed
- username-based profile routing

### Acceptance Criteria

- Lesson notes match the real codebase after the refactor.
- Teammates can explain the new notification and routing logic from the lesson files alone.

## Recommended Implementation Order

1. Phase 1: lock the API contract and remove the duplicate comment route.
2. Phase 2: refactor the Prisma notification model and migration.
3. Phase 3: move notification creation into backend controllers.
4. Phase 4: clean friend and feed backend behavior.
5. Phase 5: update `frontend/lib/api.ts`.
6. Phase 6: migrate `/profil` to `/profile/[username]`.
7. Phase 7: make notification entries actionable.
8. Phase 8: add feed tabs and remove deprecated settings routes.
9. Phase 9: run regression testing.
10. Phase 10: update `other/lessons/`.

## Out Of Scope For Now

- Full API naming consistency cleanup across the whole project.
- Advanced pagination/cursor-based feeds.
- A dedicated `/posts/[id]` page.
- DM/message notification flows if direct messages are not already implemented.
- Any unrelated UI redesign.
