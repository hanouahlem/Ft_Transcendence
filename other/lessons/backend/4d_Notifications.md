# 4d. Notifications

Goal: be able to explain the complete notification implementation in this repo: why notifications exist, how they are stored, which backend actions create or delete them, how unread state works, and how the frontend renders and updates them live.

This lesson covers our actual codebase. Do not describe it as a generic notification system during evaluation.

## 1. What the Subject Requires

The source of truth is `other/transcendance.md`.

Relevant module line:

```md
*   **Minor:** A complete notification system for all creation, update, and deletion actions.
```

In our implementation, notifications are used for social and content activity:

- friend request created
- friend request accepted
- accepted friend removed
- post liked or unliked
- post favorited or unfavorited
- post commented
- comment deleted
- comment liked or unliked
- comment favorited or unfavorited
- direct message received

Important evaluator wording:

- Notifications are stored in PostgreSQL through Prisma.
- Notifications are read through REST.
- Notifications are pushed live through Socket.io.
- Socket.io is not the source of truth; the database is.

## 2. Files That Matter

Backend:

- `backend/prisma/schema.prisma`
- `backend/src/services/notificationService.js`
- `backend/src/services/inboxService.js`
- `backend/src/controllers/notifController.js`
- `backend/src/controllers/friendController.js`
- `backend/src/controllers/postController.js`
- `backend/src/controllers/messageController.js`
- `backend/src/routes/routes.js`
- `backend/src/socketEvents.js`

Frontend:

- `frontend/lib/api.ts`
- `frontend/lib/notification-utils.ts`
- `frontend/lib/socket-events.ts`
- `frontend/app/(app)/notifications/page.tsx`
- `frontend/context/InboxUnreadContext.tsx`
- `frontend/components/notifications/NotificationCard.tsx`
- `frontend/components/notifications/LikeNotificationGroupCard.tsx`
- `frontend/components/notifications/NotificationsRail.tsx`
- `frontend/components/layout/LiveInboxToasts.tsx`
- `frontend/components/ui/toaster.tsx`

## 3. Notification Data Model

The database model is in `backend/prisma/schema.prisma`:

```prisma
model Notification {
  id        Int      @id @default(autoincrement())
  type      String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation("notificationRecipient", fields: [userId], references: [id], onDelete: Cascade)
  userId    Int

  actor     User     @relation("notificationActor", fields: [actorId], references: [id], onDelete: Cascade)
  actorId   Int

  post      Post?    @relation(fields: [postId], references: [id], onDelete: SetNull)
  postId    Int?

  @@index([userId])
  @@index([actorId])
  @@index([postId])
}
```

Field meanings:

- `id`: unique notification ID.
- `type`: string category such as `LIKE`, `COMMENT`, or `MESSAGE`.
- `read`: unread/read state for badges and UI styling.
- `createdAt`: sorting timestamp.
- `userId`: recipient, the user who receives the notification.
- `actorId`: actor, the user who caused the notification.
- `postId`: optional related post. Friend and message notifications do not need it.

Important relation behavior:

- `user` uses `onDelete: Cascade`, so deleting a recipient user deletes their received notifications.
- `actor` uses `onDelete: Cascade`, so deleting the actor user deletes notifications caused by them.
- `post` uses `onDelete: SetNull`, so if a post disappears, the notification can still exist but no longer links to that post.

The indexes help common lookups:

- `@@index([userId])`: fetch one user's notification feed quickly.
- `@@index([actorId])`: find notifications caused by a user.
- `@@index([postId])`: find notifications attached to a post.

## 4. Notification Types

The canonical backend list is in `backend/src/services/notificationService.js`:

```js
export const NOTIFICATION_TYPES = Object.freeze({
  FOLLOW: "FOLLOW",
  UNFOLLOW: "UNFOLLOW",
  FOLLOW_ACCEPT: "FOLLOW_ACCEPT",
  LIKE: "LIKE",
  FAVORITE: "FAVORITE",
  COMMENT: "COMMENT",
  COMMENT_LIKE: "COMMENT_LIKE",
  COMMENT_FAVORITE: "COMMENT_FAVORITE",
  MENTION: "MENTION",
  MESSAGE: "MESSAGE",
});
```

The frontend mirrors that list in `frontend/lib/api.ts`:

```ts
export const NOTIFICATION_TYPES = [
  "FOLLOW",
  "UNFOLLOW",
  "FOLLOW_ACCEPT",
  "LIKE",
  "FAVORITE",
  "COMMENT",
  "COMMENT_LIKE",
  "COMMENT_FAVORITE",
  "MENTION",
  "MESSAGE",
] as const;
```

Why both lists exist:

- backend list is used to create valid notification rows
- frontend list gives TypeScript a known union type
- event payloads and REST responses use the same string values

Important limitation:

- `MENTION` exists in the type list and the UI knows how to render it.
- There is no current backend producer that creates `MENTION` notifications.
- During evaluation, say it is prepared in the model/UI but not currently emitted by a feature.

## 5. The Notification Service

Most notification logic is centralized in `backend/src/services/notificationService.js`.

This avoids copying notification creation, serialization, and socket emission into every controller.

### `notificationInclude`

Real code:

```js
export const notificationInclude = {
  actor: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
    },
  },
  post: {
    select: {
      id: true,
      content: true,
    },
  },
};
```

Purpose:

- Every notification response needs actor display data.
- Post-related notifications need enough post data to show a preview.
- We select only the fields the UI needs.

### `isValidNotificationType(type)`

Real code:

```js
const VALID_NOTIFICATION_TYPES = new Set(Object.values(NOTIFICATION_TYPES));

export function isValidNotificationType(type) {
  return VALID_NOTIFICATION_TYPES.has(type);
}
```

Purpose:

- Gives us a central validator for notification types.
- It is currently available but not heavily used by the controllers because controllers use constants directly.

### `serializeNotification(notification)`

Real code:

```js
export function serializeNotification(notification) {
  return {
    ...notification,
    postId: notification.postId ?? notification.post?.id ?? null,
  };
}
```

Purpose:

- Normalizes `postId` for the frontend.
- Some Prisma results include `postId`; some include a nested `post`.
- The UI should not care which shape Prisma returned.

### `createNotification(...)`

Real code shape:

```js
export async function createNotification({ userId, actorId, type, postId = null }) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      actorId,
      type,
      postId,
    },
    include: notificationInclude,
  });

  try {
    getSocketServer()
      .to(getUserRoomName(userId))
      .emit(SOCKET_EVENTS.NOTIFICATION_CREATED, {
        notification: serializeNotification(notification),
      });

    await emitInboxUnreadCounts(userId);
  } catch (error) {
    console.error("createNotification socket emit error:", error);
  }

  return notification;
}
```

What it does:

1. Creates the row in PostgreSQL with Prisma.
2. Includes actor and post display data.
3. Emits `notification:created` to the recipient's private Socket.io room.
4. Emits refreshed inbox unread counts.
5. Returns the created notification.

Why the socket code is wrapped in `try/catch`:

- The database write already succeeded.
- A temporary Socket.io failure should not make the API request fail.
- On page refresh or reconnect, REST can fetch the correct database state again.

Evaluator phrase:

> Notifications are durable in the database, and live delivery is best-effort.

### `createNotificationIfRelevant(...)`

Real code shape:

```js
export async function createNotificationIfRelevant({
  userId,
  actorId,
  type,
  postId = null,
}) {
  const recipientId = Number(userId);
  const resolvedActorId = Number(actorId);

  if (
    Number.isNaN(recipientId) ||
    Number.isNaN(resolvedActorId) ||
    recipientId < 1 ||
    resolvedActorId < 1 ||
    recipientId === resolvedActorId
  ) {
    return null;
  }

  return createNotification({
    userId: recipientId,
    actorId: resolvedActorId,
    type,
    postId,
  });
}
```

Purpose:

- Prevents notifications for invalid users.
- Prevents self-notifications.

Example:

- If I like my own post, `recipientId === actorId`, so no notification is created.
- If another user likes my post, a `LIKE` notification is created for me.

### `deleteNotificationIfExists(...)`

Used when an action is undone.

Example:

- user likes a post -> create `LIKE` notification
- same user unlikes the post -> delete the matching `LIKE` notification

Important code shape:

```js
const match = await prisma.notification.findFirst({
  where: {
    userId: recipientId,
    actorId: resolvedActorId,
    type,
    postId: resolvedPostId,
  },
  select: { id: true },
});

if (!match) {
  return null;
}

await prisma.notification.delete({ where: { id: match.id } });
```

Then it emits:

```js
getSocketServer()
  .to(getUserRoomName(recipientId))
  .emit(SOCKET_EVENTS.NOTIFICATION_DELETED, { notificationId: match.id });

await emitInboxUnreadCounts(recipientId);
```

Why this matters:

- The UI can remove a notification live when the original action is undone.
- The unread badge stays correct.

### `emitNotificationRead(...)`

Used after a notification is marked as read:

```js
getSocketServer()
  .to(getUserRoomName(resolvedUserId))
  .emit(SOCKET_EVENTS.NOTIFICATION_READ, {
    notificationId: resolvedNotificationId,
  });
```

Purpose:

- If the same user has multiple tabs open, marking a notification as read in one tab marks it read in the others.

## 6. REST API Routes

Routes are defined in `backend/src/routes/routes.js`:

```js
router.get("/notifications", authMiddleware, notif.getNotif);
router.post("/notifications", authMiddleware, notif.createNotif);
router.patch("/notifications/:id/read", authMiddleware, notif.markAsRead);
router.delete("/notifications/:id", authMiddleware, notif.deleteNotif);
```

All routes use `authMiddleware`, so `req.user` is available and users can only access their own notifications.

### `POST /notifications`

Controller:

```js
export async function createNotif(req, res){
    return res.status(403).json({
        message: "Notifications are created automatically from backend events.",
    });
}
```

Why this route returns `403`:

- Users should not manually invent notifications.
- Notifications are side effects of real backend actions.
- This protects integrity: a notification should prove something happened.

### `GET /notifications`

Controller shape:

```js
const allNotifs = await prisma.notification.findMany({
  where: { userId },
  include: notificationInclude,
  orderBy: {createdAt: 'desc'}
});
```

What it does:

- Reads `userId` from the JWT (`req.user.id`).
- Fetches only that user's notifications.
- Includes actor and post display data.
- Orders newest first.
- Serializes each notification before returning it.

Important authorization point:

- The client does not send a `userId`.
- The backend trusts the JWT, not the browser, to choose whose notifications to fetch.

### `PATCH /notifications/:id/read`

Controller flow:

1. Read `userId` from `req.user.id`.
2. Parse `notifId` from `req.params.id`.
3. Find the notification with both `id` and `userId`.
4. If not found, return `404`.
5. Update `read: true`.
6. Emit `notification:read`.
7. Emit refreshed unread counts.
8. Return the updated notification.

Key ownership check:

```js
const notification = await prisma.notification.findFirst({
  where: { id: notifId , userId }
});
```

This prevents one user from marking another user's notification as read.

### `DELETE /notifications/:id`

Controller flow:

1. Read `userId` from JWT.
2. Find the notification by `{ id, userId }`.
3. Return `404` if it does not belong to this user.
4. Remember whether it was unread.
5. Delete it.
6. If it was unread, emit refreshed unread counts.

Important limitation:

- Manual delete currently refreshes unread counts.
- It does not emit `notification:deleted` from `notifController.js`.
- Action-undo deletes through `deleteNotificationIfExists(...)` do emit `notification:deleted`.

## 7. Where Notifications Are Produced

Notifications are not created by the notification controller.
They are created by feature controllers after real actions succeed.

### Friends

File: `backend/src/controllers/friendController.js`

Friend request:

```js
await createNotificationIfRelevant({
  userId: receiverId,
  actorId: senderId,
  type: NOTIFICATION_TYPES.FOLLOW,
});
```

Meaning:

- recipient gets notified that someone sent a friend request.

Accept friend request:

```js
await createNotificationIfRelevant({
  userId: friends.senderId,
  actorId: userId,
  type: NOTIFICATION_TYPES.FOLLOW_ACCEPT,
});
```

Meaning:

- original sender gets notified that the request was accepted.

Remove accepted friend:

```js
await createNotificationIfRelevant({
  userId: otherUserId,
  actorId: userId,
  type: NOTIFICATION_TYPES.UNFOLLOW,
});
```

Meaning:

- the other accepted friend gets notified that the connection was removed.

### Posts

File: `backend/src/controllers/postController.js`

Like post:

```js
if (likeResult.created) {
  await createNotificationIfRelevant({
    userId: likeResult.postAuthorId,
    actorId: userId,
    type: NOTIFICATION_TYPES.LIKE,
    postId,
  });
}
```

Unlike post:

```js
if (result.removed) {
  await deleteNotificationIfExists({
    userId: result.postAuthorId,
    actorId: userId,
    type: NOTIFICATION_TYPES.LIKE,
    postId,
  });
}
```

Favorite/unfavorite post uses the same pattern with `FAVORITE`.

Comment on a post:

```js
await createNotificationIfRelevant({
  userId: postAuthorId,
  actorId: userId,
  type: NOTIFICATION_TYPES.COMMENT,
  postId,
});
```

Delete a comment:

```js
await deleteNotificationIfExists({
  userId: deleteResult.postAuthorId,
  actorId: userId,
  type: NOTIFICATION_TYPES.COMMENT,
  postId: deleteResult.postId,
});
```

Important behavior:

- If the comment notification exists, deleting the comment removes that notification.
- If it does not exist, the helper returns `null` and the API still succeeds.

### Comments

Still in `backend/src/controllers/postController.js`.

Like comment:

```js
await createNotificationIfRelevant({
  userId: likeResult.commentAuthorId,
  actorId: userId,
  type: NOTIFICATION_TYPES.COMMENT_LIKE,
  postId: likeResult.postId,
});
```

Unlike comment deletes the matching `COMMENT_LIKE` notification.

Favorite comment:

```js
await createNotificationIfRelevant({
  userId: favResult.commentAuthorId,
  actorId: userId,
  type: NOTIFICATION_TYPES.COMMENT_FAVORITE,
  postId: favResult.postId,
});
```

Unfavorite comment deletes the matching `COMMENT_FAVORITE` notification.

### Direct Messages

File: `backend/src/controllers/messageController.js`

After a message is created, recipients are loaded:

```js
const recipients = await prisma.conversationMember.findMany({
  where: {
    conversationId,
    userId: {
      not: currentUserId,
    },
  },
  select: {
    userId: true,
  },
});
```

Then each recipient gets a message notification:

```js
await Promise.all(
  recipients.map((recipient) =>
    createNotificationIfRelevant({
      userId: recipient.userId,
      actorId: currentUserId,
      type: NOTIFICATION_TYPES.MESSAGE,
    }),
  ),
);
```

Important detail:

- A message also emits `message:created`.
- The `MESSAGE` notification exists for the notification ledger and unread notification count.
- `LiveInboxToasts.tsx` intentionally does not show a second notification toast for `MESSAGE`, because the message toast already covers the live alert.

## 8. Unread Counts

Unread counts are centralized in `backend/src/services/inboxService.js`.

Notification unread count:

```js
return prisma.notification.count({
  where: {
    userId: resolvedUserId,
    read: false,
  },
});
```

Combined unread counts:

```js
const [unreadMessagesCount, unreadNotificationsCount] = await Promise.all([
  getUnreadMessagesCount(resolvedUserId),
  getUnreadNotificationsCount(resolvedUserId),
]);
```

Why this service exists:

- Sidebar badges need both unread messages and unread notifications.
- Multiple controllers need to emit updated counts.
- Centralizing the logic prevents inconsistent badge behavior.

Socket emit:

```js
getSocketServer()
  .to(getUserRoomName(resolvedUserId))
  .emit(SOCKET_EVENTS.INBOX_UNREAD_COUNTS, counts);
```

Frontend owner:

- `frontend/context/InboxUnreadContext.tsx`

It:

- fetches unread counts from REST on cold start
- listens to `inbox:unread-counts`
- refreshes counts on socket reconnect
- refreshes counts on focus/visibility return

Evaluator phrase:

> The sidebar badge is live through sockets, but it can recover through REST after refresh, reconnect, or missed events.

## 9. Real-Time Events

Backend event names are in `backend/src/socketEvents.js`.
Frontend event names and TypeScript payload types are in `frontend/lib/socket-events.ts`.

Notification-related events:

```ts
NOTIFICATION_CREATED: "notification:created",
NOTIFICATION_READ: "notification:read",
NOTIFICATION_DELETED: "notification:deleted",
INBOX_UNREAD_COUNTS: "inbox:unread-counts",
```

Payload types:

```ts
export type NotificationCreatedEvent = {
  notification: NotificationItem;
};

export type NotificationReadEvent = {
  notificationId: number;
};

export type NotificationDeletedEvent = {
  notificationId: number;
};
```

Room target:

```js
getSocketServer()
  .to(getUserRoomName(userId))
  .emit(...);
```

Why per-user rooms matter:

- notifications are private
- one user may have multiple browser tabs open
- one emit reaches all active sockets for that user
- we avoid global broadcasting of private data

## 10. Frontend API Types and Calls

File: `frontend/lib/api.ts`

Notification item shape:

```ts
export type NotificationItem = {
  id: number;
  type: NotificationType | string;
  read: boolean;
  createdAt: string;
  userId: number;
  actorId: number;
  actor: NotificationActor;
  postId: number | null;
  post?: {
    id: number;
    content?: string | null;
  } | null;
};
```

The API helpers:

```ts
export async function getNotifications(token?: string | null) {
  return requestWithAuth<NotificationsResponse>("/notifications", { token });
}

export async function markNotificationAsRead(
  notificationId: number,
  token?: string | null,
) {
  return requestWithAuth<NotificationActionResponse>(
    `/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      token,
    },
  );
}

export async function deleteNotification(
  notificationId: number,
  token?: string | null,
) {
  return requestWithAuth<{ message: string }>(`/notifications/${notificationId}`, {
    method: "DELETE",
    token,
  });
}
```

Important concept:

- `token` becomes `Authorization: Bearer <token>` inside the shared request helpers.
- Protected backend routes read the user from the JWT.

## 11. Notifications Page State

File: `frontend/app/(app)/notifications/page.tsx`

Main state:

```ts
const [notifications, setNotifications] = useState<NotificationItem[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [searchValue, setSearchValue] = useState("");
const [filters, setFilters] = useState<NotificationFilterState>(DEFAULT_FILTERS);
const [markingAll, setMarkingAll] = useState(false);
```

The page owns durable notification list state.
Global toasts do not own durable notification state.

### Fetching Notifications

`fetchNotifications(...)`:

1. requires a token
2. calls `getNotifications(token)`
3. validates the API result
4. stores `result.data.allNotifs`
5. displays an error toast if needed
6. clears loading in `finally`

Important:

- Initial load is REST.
- Reconnect recovery is REST.
- Socket events only update already-loaded state.

### Unread Count Derived From Page State

Real code:

```ts
const unreadCount = useMemo(
  () => notifications.filter((notification) => !notification.read).length,
  [notifications],
);
```

Then:

```ts
useEffect(() => {
  if (loading) {
    return;
  }

  setUnreadNotificationsCount(unreadCount);
}, [loading, setUnreadNotificationsCount, unreadCount]);
```

Purpose:

- When the notifications page has accurate local state, it updates the global sidebar count too.

### Live Create

Socket handler:

```ts
setNotifications((current) => {
  if (current.some((entry) => entry.id === normalizedNotification.id)) {
    return current;
  }

  return [normalizedNotification, ...current];
});
```

Why duplicate guard matters:

- REST refetch and socket events can overlap.
- The same notification should not appear twice.

### Live Read

Socket handler:

```ts
setNotifications((current) =>
  current.map((notification) =>
    notification.id === notificationId
      ? { ...notification, read: true }
      : notification,
  ),
);
```

Purpose:

- Multi-tab synchronization.
- If tab A marks as read, tab B updates without refresh.

### Live Delete

Socket handler:

```ts
setNotifications((current) =>
  current.filter((notification) => notification.id !== notificationId),
);
```

Purpose:

- If an action is undone and the backend emits `notification:deleted`, the page removes it live.

### Reconnect Recovery

Real code shape:

```ts
useEffect(() => {
  if (!token || !isConnected) {
    return;
  }

  void fetchNotifications({ notifyOnError: false });
}, [fetchNotifications, isConnected, token]);
```

Why:

- Socket.io cannot guarantee the page received every event while disconnected.
- Refetching after reconnect restores the correct database state.

## 12. Marking Notifications Read

The page uses an optimistic update:

```ts
const previousNotifications = notifications;

try {
  setNotifications((current) =>
    current.map((notification) =>
      targetIds.includes(notification.id)
        ? { ...notification, read: true }
        : notification,
    ),
  );

  const results = await Promise.all(
    targetIds.map((notificationId) =>
      markNotificationAsRead(notificationId, token),
    ),
  );
  ...
} catch (markError) {
  setNotifications(previousNotifications);
  throw markError;
}
```

Concepts:

- Optimistic update means the UI updates before the server confirms.
- If the server fails, state rolls back to `previousNotifications`.
- `Promise.all(...)` lets "mark all as read" send multiple requests in parallel.

Why mark all calls the single mark endpoint repeatedly:

- There is no backend batch endpoint.
- The page reuses the one safe ownership-checked endpoint.

## 13. Filtering, Searching, and Grouping

File: `frontend/lib/notification-utils.ts`

### Categories

```ts
export type NotificationCategory = "social" | "post" | "message";
```

Mapping:

```ts
export function getNotificationCategory(type) {
  switch (type) {
    case "FOLLOW":
    case "FOLLOW_ACCEPT":
    case "UNFOLLOW":
      return "social";
    case "LIKE":
    case "FAVORITE":
    case "COMMENT":
    case "COMMENT_LIKE":
    case "COMMENT_FAVORITE":
    case "MENTION":
      return "post";
    default:
      return "message";
  }
}
```

This is used by `NotificationsRail` filters.

### Hrefs

```ts
export function getNotificationHref(notification: NotificationItem) {
  const actorUsername = encodeURIComponent(notification.actor.username);
  const actorProfileHref = `/profile/${actorUsername}`;

  switch (notification.type) {
    case "LIKE":
    case "FAVORITE":
    case "COMMENT":
    case "COMMENT_LIKE":
    case "COMMENT_FAVORITE":
      return notification.postId ? `/profile?post=${notification.postId}` : "/profile";
    case "MENTION":
      return notification.postId
        ? `${actorProfileHref}?post=${notification.postId}`
        : actorProfileHref;
    default:
      return actorProfileHref;
  }
}
```

Meaning:

- post activity opens the related post dialog if possible
- mention opens the actor profile and post
- friend/message/default notifications open the actor profile

### Copy

`getNotificationCopy(...)` converts a type into UI text:

- `FOLLOW`: "sent you a friend request"
- `FOLLOW_ACCEPT`: "accepted your friend request"
- `LIKE`: "liked your post"
- `COMMENT`: "commented on your post"
- `MESSAGE`: "sent you a message"

Some branches use translations through `t(...)`; some currently use hardcoded English fallback text.

### Like Grouping

`buildNotificationLedgerItems(...)` groups likes when there are more than 3 likes for the same post:

```ts
if (groupedNotifications.length <= 3) {
  return [{ kind: "single", id: `notification-${notification.id}`, notification }];
}
```

When there are more than 3:

```ts
return [
  {
    kind: "like-group",
    id: `like-group-${notification.postId}`,
    notifications: groupedNotifications,
    latestNotification: groupedNotifications[0],
    actors: getUniqueActors(groupedNotifications),
    likeCount: groupedNotifications.length,
    unread: groupedNotifications.some(
      (groupedNotification) => !groupedNotification.read,
    ),
    createdAt: groupedNotifications[0].createdAt,
    postId: notification.postId,
  },
];
```

Purpose:

- Avoid a noisy notification page when many users like the same post.
- Still preserve the individual notification rows in the database.
- Marking the group as read marks all unread notifications in that group.

## 14. UI Components

### `NotificationCard`

File: `frontend/components/notifications/NotificationCard.tsx`

Responsibilities:

- render a single notification
- show actor identity
- show icon/tone based on type
- show relative time
- mark as read before navigation
- navigate to `getNotificationHref(notification)`

Important code:

```ts
const navigateToRecord = () => {
  if (!notification.read) {
    void onMarkAsRead(notification.id);
  }

  router.push(href);
};
```

Keyboard accessibility:

```ts
if (event.key === "Enter" || event.key === " ") {
  event.preventDefault();
  navigateToRecord();
}
```

Meaning:

- The card behaves like a button for mouse and keyboard users.

### `LikeNotificationGroupCard`

File: `frontend/components/notifications/LikeNotificationGroupCard.tsx`

Responsibilities:

- render many like notifications as one grouped card
- show up to three actor avatars
- mark all unread notifications in the group as read
- navigate to the post

Important code:

```ts
const unreadIds = group.notifications
  .filter((notification) => !notification.read)
  .map((notification) => notification.id);
```

When opened:

```ts
if (unreadIds.length > 0) {
  void onMarkAsRead(unreadIds);
}

router.push(`/profile?post=${group.postId}`);
```

### `NotificationsRail`

File: `frontend/components/notifications/NotificationsRail.tsx`

Responsibilities:

- search input
- total/unread/read stats
- "mark all as read" button
- social/post/message filter toggles

Important behavior:

```ts
if (!next.social && !next.post && !next.message) {
  return current;
}
```

The page prevents disabling all filters because that would create an empty UI state that looks broken.

## 15. Global Live Toasts

File: `frontend/components/layout/LiveInboxToasts.tsx`

This component listens to socket events globally and shows temporary UI feedback.

It listens to:

```ts
socket.on(SOCKET_EVENTS.MESSAGE_CREATED, handleMessageCreated);
socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, handleNotificationCreated);
```

Notification toast rules:

```ts
if (isNotificationsPage) {
  return;
}

if (normalizedNotification.type === "MESSAGE") {
  return;
}
```

Meaning:

- If you are already on `/notifications`, do not show a redundant notification toast.
- If the notification is `MESSAGE`, do not show a second toast because `message:created` already creates a message toast.

The toast gets metadata:

```ts
archiveToaster.info({
  title: "Notification",
  duration: 5000,
  closable: false,
  meta: {
    kind: "notification",
    notification: normalizedNotification,
  },
});
```

The shared toaster (`frontend/components/ui/toaster.tsx`) uses this metadata to render a richer notification toast and choose the same navigation href as the notification card.

Important separation:

- `LiveInboxToasts.tsx` does not store notification state.
- `notifications/page.tsx` stores notification state.
- `InboxUnreadContext.tsx` stores sidebar badge counts.

## 16. Full Flow Example: Liking A Post

1. User clicks like in the frontend.
2. Frontend calls the like post API.
3. `backend/src/controllers/postController.js` runs `likePostHandler`.
4. `likePost(...)` writes the `Like` row.
5. If the like was newly created, the controller calls:

```js
await createNotificationIfRelevant({
  userId: likeResult.postAuthorId,
  actorId: userId,
  type: NOTIFICATION_TYPES.LIKE,
  postId,
});
```

6. `createNotificationIfRelevant(...)` rejects self-notifications.
7. `createNotification(...)` creates the `Notification` row.
8. Backend emits `notification:created` to `user:<postAuthorId>`.
9. Backend emits `inbox:unread-counts`.
10. Recipient's sidebar badge updates.
11. Recipient's notifications page prepends the new notification if open.
12. Recipient gets a live toast if not already on `/notifications`.
13. On refresh, `GET /notifications` still returns the row because PostgreSQL is the source of truth.

## 17. Full Flow Example: Unliking A Post

1. User clicks unlike.
2. Frontend calls the unlike API.
3. `unlikePostHandler` removes the `Like` row through `unlikePost(...)`.
4. If a like was actually removed, controller calls:

```js
await deleteNotificationIfExists({
  userId: result.postAuthorId,
  actorId: userId,
  type: NOTIFICATION_TYPES.LIKE,
  postId,
});
```

5. The service finds the matching notification by recipient, actor, type, and post.
6. It deletes the notification row if found.
7. It emits `notification:deleted`.
8. It emits updated unread counts.
9. Open notifications pages remove the deleted item from local state.

## 18. Full Flow Example: Marking A Notification Read

1. User clicks a notification card.
2. `NotificationCard` calls `onMarkAsRead(notification.id)`.
3. `notifications/page.tsx` optimistically marks it read.
4. Frontend calls `PATCH /notifications/:id/read`.
5. Backend verifies the notification belongs to `req.user.id`.
6. Backend updates `read: true`.
7. Backend emits `notification:read`.
8. Backend emits `inbox:unread-counts`.
9. Other tabs update the same notification to read.
10. Sidebar unread badge decreases.
11. The card navigates to the related profile or post.

## 19. Key Concepts To Explain

### Durable vs transient

Durable:

- `Notification` rows in PostgreSQL.

Transient:

- Socket.io events.
- Toasts.
- Local React state.

### Recipient vs actor

Recipient:

- `userId`
- user who receives the notification

Actor:

- `actorId`
- user who caused the notification

Example:

- Alice likes Bob's post.
- Bob is `userId`.
- Alice is `actorId`.

### Read state

Read state is stored on the notification row:

```prisma
read Boolean @default(false)
```

It is not just a frontend flag.

### Best-effort sockets

Socket failure should not break successful business actions.

That is why notification creation writes the DB row first and catches socket errors after.

### Authorization

The backend always uses `req.user.id`.

The frontend never chooses which user's notifications to fetch, mark, or delete.

## 20. Current Limitations

Be honest during evaluation:

- `MENTION` has frontend support but no active backend producer.
- Manual delete through `DELETE /notifications/:id` does not currently emit `notification:deleted`; it only refreshes unread counts if the deleted item was unread.
- There is no backend batch endpoint for "mark all as read"; the frontend loops over individual `PATCH /notifications/:id/read` calls.
- Some notification copy branches in `frontend/lib/notification-utils.ts` still use hardcoded English fallback text instead of full translation keys.
- Notifications are tied to our social/feed/message features, not every possible database update in the whole application.

## 21. Common Evaluation Questions

### Why not let users create notifications directly?

Because notifications should represent real backend events. `POST /notifications` returns `403` so clients cannot forge fake notifications.

### Why does `createNotificationIfRelevant(...)` skip self-notifications?

Because users do not need notifications for actions they performed on their own content.

### Why include actor data in notification queries?

The UI needs actor username, display name, and avatar to render notification cards without extra API calls.

### Why emit unread counts separately?

A notification event tells the page what changed. An unread-count event gives the sidebar the authoritative badge totals.

### Why still fetch notifications with REST if sockets exist?

REST loads durable state on page open and recovers from missed socket events. Sockets only keep already-loaded UI fresh.

### Why group likes?

Many likes on one post can flood the page. Grouping improves readability while keeping individual database rows.

### How do we prevent users from reading/deleting someone else's notification?

`markAsRead` and `deleteNotif` both query with `{ id: notifId, userId }`, where `userId` comes from the JWT.

## 22. Self-Check Questions

- Can I explain the difference between `userId` and `actorId`?
- Can I explain why `postId` is nullable?
- Can I explain why `POST /notifications` returns `403`?
- Can I list which controllers create notifications?
- Can I explain `createNotificationIfRelevant(...)` and why self-notifications are skipped?
- Can I explain why unlikes/unfavorites delete matching notifications?
- Can I explain how `notification:created`, `notification:read`, and `notification:deleted` affect the frontend?
- Can I explain why unread counts live in `inboxService.js`?
- Can I explain why the notifications page refetches on reconnect?
- Can I explain the current limitations without overstating the module?
