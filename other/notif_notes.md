⏺ The current schema is pretty bare-bones. Here's what's missing for a Twitter-like app:

  Current model:
  Notification { id, content (string), read, createdAt, userId }

  Issues:

  1. No type field — You can't distinguish between a like, follow, comment, repost, or mention. The frontend has no way to render different
  notification styles or icons, and you can't filter by type.
  2. No link to the actor — There's no actorId (the user who triggered it). You can't show "@john liked your post" without it — you'd have to parse
  the content string.
  3. No link to the target resource — No postId, commentId, etc. The notification can't link the user to the relevant post/comment when clicked.
  4. content is a plain string — This means notification text is hardcoded at creation time. If a user changes their display name, old notifications
  still show the old name. It also makes i18n impossible.

  A better schema would look like:
  model Notification {
    id        Int      @id @default(autoincrement())
    type      String   // "like", "follow", "comment", "repost", "mention"
    read      Boolean  @default(false)
    createdAt DateTime @default(now())

    user      User     @relation("notificationRecipient", fields: [userId], references: [id])
    userId    Int

    actor     User     @relation("notificationActor", fields: [actorId], references: [id])
    actorId   Int

    postId    Int?     // nullable — not all notifs relate to a post
    post      Post?    @relation(fields: [postId], references: [id])

    commentId Int?     // nullable
    comment   Comment? @relation(fields: [commentId], references: [id])
  }

  This way the frontend builds the notification text dynamically: "{actor.displayName} {type} your {post/comment}" — no more fragile content strings.

  Want me to update the schema and controller?
