# Notification System Notes

## Requirements

The 42 subject requires: "A complete notification system for all creation, update, and deletion actions."

---

## Current Model (Broken)

```
Notification { id, content (string), read, createdAt, userId }
```

Issues:
1. No `type` field — the frontend can't render different styles/icons or filter by type.
2. No `actorId` — can't show "@alice liked your post" without parsing the content string.
3. No `postId` — can't link the user to the relevant post when clicked.
4. `content` is a plain string — if a user changes their display name, old notifications show the stale name.

---

## Target Model

```prisma
model Notification {
  id            Int      @id @default(autoincrement())
  type          String   // FOLLOW, UNFOLLOW, FOLLOW_ACCEPT, LIKE, COMMENT, MENTION, MESSAGE
  read          Boolean  @default(false)
  createdAt     DateTime @default(now())

  user          User     @relation("notificationRecipient", fields: [userId], references: [id])
  userId        Int

  actor         User     @relation("notificationActor", fields: [actorId], references: [id])
  actorId       Int

  postId        Int?     // nullable — not all notifs relate to a post
  post          Post?    @relation(fields: [postId], references: [id])
}
```

No `commentId` needed — linking to the post is enough. The frontend builds the text dynamically from type + actor.

---

## Notification Types

| Type           | Trigger                         | actorId | postId | Links to                              |
|----------------|---------------------------------|---------|--------|---------------------------------------|
| FOLLOW         | Someone follows you             | yes     | no     | `/profile/[actorUsername]`            |
| UNFOLLOW       | Someone unfollows you           | yes     | no     | `/profile/[actorUsername]`            |
| FOLLOW_ACCEPT  | A follow request was accepted   | yes     | no     | `/profile/[actorUsername]`            |
| LIKE           | Someone likes your post         | yes     | yes    | `/profile/[username]?post=[postId]`   |
| COMMENT        | Someone comments on your post   | yes     | yes    | `/profile/[username]?post=[postId]`   |
| MENTION        | Someone @mentions you           | yes     | yes    | `/profile/[username]?post=[postId]`   |
| MESSAGE        | Someone sends you a DM          | yes     | no     | DM page (not yet implemented)         |

MENTION and MESSAGE are not yet implemented but included for completeness.

---

## Frontend Linking Strategy

- The backend fetches `actor.username` via `include: { actor: { select: { username, avatar } } }` when returning notifications.
- This means the username is always current — if the actor changed their username, the link still works.
- The frontend receives `actor.username` in the response and builds the link from it directly, no extra API call needed.
- For post-related notifications (LIKE, COMMENT, MENTION), the link includes `?post=[postId]`.
- The profile page reads the `?post=` query param on mount and auto-opens the post dialog.
- If the `?post=` feature is not done in time, linking to the actor's profile alone is enough for evaluation.

---

## Backend: Keep Creation Internal

From api_notes.md: notifications should not be created by the client via `POST /notifications`.

Notifications are created internally by backend logic when a real event happens:
- Friend/follow controller creates FOLLOW / UNFOLLOW / FOLLOW_ACCEPT notifications.
- Post like handler creates LIKE notifications.
- Comment handler creates COMMENT notifications.
- Remove or restrict the public `POST /notifications` route.

---

## What Should Change Now

1. Update the Prisma schema to the target model above.
2. Create notifications internally in the relevant controllers (follow, like, comment).
3. Remove or restrict the public `POST /notifications` endpoint.
4. Update the frontend `/notifications` page to render type-specific text and link each notification to the right profile/post.
5. Drop the `content` string field — the frontend builds display text from `type` + `actor`.
