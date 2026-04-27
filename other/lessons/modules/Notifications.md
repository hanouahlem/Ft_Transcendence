# Notifications Module Lesson

Goal: be able to explain our notification module end to end during evaluation: database model, backend event producers, REST routes, Socket.io delivery, unread badges, frontend page state, filtering, grouping, and live toasts.

Source of truth: `other/transcendance.md` lists the notification system as a minor Web module: "A complete notification system for all creation, update, and deletion actions."

## 1. The Big Idea

Our notification system has three layers:

- Database layer: durable `Notification` rows in PostgreSQL through Prisma.
- API layer: protected REST routes to list, mark read, and delete notifications.
- Real-time layer: Socket.io events to update open clients immediately.

Important evaluation sentence:

> The database is the source of truth. Socket.io only delivers live changes to clients that are currently connected.

## 2. Notification Types

Backend type constants live in `backend/src/services/notificationService.js`.

Line references:

- `backend/src/services/notificationService.js:6` starts `NOTIFICATION_TYPES`.
- `backend/src/services/notificationService.js:7` defines `FOLLOW`.
- `backend/src/services/notificationService.js:8` defines `UNFOLLOW`.
- `backend/src/services/notificationService.js:9` defines `FOLLOW_ACCEPT`.
- `backend/src/services/notificationService.js:10` defines `LIKE`.
- `backend/src/services/notificationService.js:11` defines `FAVORITE`.
- `backend/src/services/notificationService.js:12` defines `COMMENT`.
- `backend/src/services/notificationService.js:13` defines `COMMENT_LIKE`.
- `backend/src/services/notificationService.js:14` defines `COMMENT_FAVORITE`.
- `backend/src/services/notificationService.js:15` defines `MENTION`.
- `backend/src/services/notificationService.js:16` defines `MESSAGE`.

Important limitation:

- `MENTION` exists in constants and frontend rendering logic.
- There is no current backend feature that creates `MENTION` notifications.

## 3. Recipient, Actor, And Optional Post

The notification service uses three main IDs:

- `userId`: recipient, the user who receives the notification.
- `actorId`: actor, the user who caused the notification.
- `postId`: optional post related to content notifications.

Example:

- Alice likes Bob's post.
- Bob is `userId`.
- Alice is `actorId`.
- Bob's post is `postId`.

## 4. Backend Include Shape

The service defines the data the frontend needs:

- `backend/src/services/notificationService.js:21` starts `notificationInclude`.
- `backend/src/services/notificationService.js:22` includes actor data.
- `backend/src/services/notificationService.js:24` selects actor ID.
- `backend/src/services/notificationService.js:25` selects username.
- `backend/src/services/notificationService.js:26` selects display name.
- `backend/src/services/notificationService.js:27` selects avatar.
- `backend/src/services/notificationService.js:30` includes related post data.
- `backend/src/services/notificationService.js:32` selects post ID.
- `backend/src/services/notificationService.js:33` selects post content.

Why:

- The notification card needs actor identity.
- Post notifications need a small post preview.
- Selecting only needed fields avoids sending the full user/post records.

## 5. Serialization

Serialization lives here:

- `backend/src/services/notificationService.js:42` defines `serializeNotification`.
- `backend/src/services/notificationService.js:45` normalizes `postId`.

Why:

- Sometimes Prisma gives `postId` directly.
- Sometimes the included `post` object is what proves the related post ID.
- The frontend should receive a consistent `postId` field.

## 6. Creating Notifications

Creation lives in `createNotification(...)`:

- `backend/src/services/notificationService.js:49` starts `createNotification`.
- `backend/src/services/notificationService.js:50` creates the Prisma row.
- `backend/src/services/notificationService.js:51` starts the row data.
- `backend/src/services/notificationService.js:52` writes `userId`.
- `backend/src/services/notificationService.js:53` writes `actorId`.
- `backend/src/services/notificationService.js:54` writes `type`.
- `backend/src/services/notificationService.js:55` writes `postId`.
- `backend/src/services/notificationService.js:57` includes actor/post display data.

Then live delivery:

- `backend/src/services/notificationService.js:60` starts best-effort socket logic.
- `backend/src/services/notificationService.js:61` gets Socket.io.
- `backend/src/services/notificationService.js:62` targets the recipient's private room.
- `backend/src/services/notificationService.js:63` emits `notification:created`.
- `backend/src/services/notificationService.js:64` sends the serialized notification.
- `backend/src/services/notificationService.js:67` emits refreshed inbox unread counts.
- `backend/src/services/notificationService.js:68` catches socket errors.
- `backend/src/services/notificationService.js:72` returns the created notification.

Evaluation explanation:

> We write the database row first, then try to notify connected clients. If the socket emit fails, the database row still exists and REST can recover it.

## 7. Avoiding Self-Notifications

The wrapper is `createNotificationIfRelevant(...)`:

- `backend/src/services/notificationService.js:142` starts the function.
- `backend/src/services/notificationService.js:148` converts recipient ID.
- `backend/src/services/notificationService.js:149` converts actor ID.
- `backend/src/services/notificationService.js:151` starts validation.
- `backend/src/services/notificationService.js:156` rejects `recipientId === resolvedActorId`.
- `backend/src/services/notificationService.js:158` returns `null` for invalid/self notifications.
- `backend/src/services/notificationService.js:161` delegates to `createNotification`.

Why:

- Users should not get notifications for their own actions.
- Invalid IDs should not create broken rows.

## 8. Deleting Generated Notifications

When an action is undone, we remove the matching notification.

Example:

- Like creates a `LIKE` notification.
- Unlike deletes that `LIKE` notification.

Line references:

- `backend/src/services/notificationService.js:99` starts `deleteNotificationIfExists`.
- `backend/src/services/notificationService.js:113` searches for a matching notification.
- `backend/src/services/notificationService.js:115` matches recipient.
- `backend/src/services/notificationService.js:116` matches actor.
- `backend/src/services/notificationService.js:117` matches type.
- `backend/src/services/notificationService.js:118` matches post.
- `backend/src/services/notificationService.js:123` returns if none exists.
- `backend/src/services/notificationService.js:127` deletes the row.
- `backend/src/services/notificationService.js:130` gets Socket.io.
- `backend/src/services/notificationService.js:131` targets recipient room.
- `backend/src/services/notificationService.js:132` emits `notification:deleted`.
- `backend/src/services/notificationService.js:134` emits refreshed unread counts.

Why matching all fields matters:

- It deletes the notification for exactly that actor/action/post combination.
- It does not delete unrelated notifications.

## 9. Marking Notifications Read

The read socket helper:

- `backend/src/services/notificationService.js:75` starts `emitNotificationRead`.
- `backend/src/services/notificationService.js:76` parses user ID.
- `backend/src/services/notificationService.js:77` parses notification ID.
- `backend/src/services/notificationService.js:79` validates IDs.
- `backend/src/services/notificationService.js:89` gets Socket.io.
- `backend/src/services/notificationService.js:90` targets the user's room.
- `backend/src/services/notificationService.js:91` emits `notification:read`.
- `backend/src/services/notificationService.js:92` sends `notificationId`.

Purpose:

- If a user has two tabs open, reading a notification in one tab updates the other.

## 10. REST Routes And Authorization

The controller is `backend/src/controllers/notifController.js`.

Manual creation is blocked:

- `backend/src/controllers/notifController.js:9` starts `createNotif`.
- `backend/src/controllers/notifController.js:10` returns `403`.
- `backend/src/controllers/notifController.js:11` explains notifications are automatic.

Why:

- Clients cannot forge fake notifications.
- Notifications represent real backend events.

Fetching:

- `backend/src/controllers/notifController.js:16` starts `getNotif`.
- `backend/src/controllers/notifController.js:19` reads `userId` from `req.user.id`.
- `backend/src/controllers/notifController.js:23` queries notifications.
- `backend/src/controllers/notifController.js:24` filters by recipient.
- `backend/src/controllers/notifController.js:25` includes actor/post data.
- `backend/src/controllers/notifController.js:26` orders newest first.
- `backend/src/controllers/notifController.js:30` serializes each notification.

Mark read:

- `backend/src/controllers/notifController.js:40` starts `markAsRead`.
- `backend/src/controllers/notifController.js:42` reads user ID from JWT.
- `backend/src/controllers/notifController.js:47` parses notification ID.
- `backend/src/controllers/notifController.js:49` searches by notification ID and user ID.
- `backend/src/controllers/notifController.js:53` returns `404` if not owned/found.
- `backend/src/controllers/notifController.js:57` updates the row.
- `backend/src/controllers/notifController.js:59` sets `read: true`.
- `backend/src/controllers/notifController.js:63` emits `notification:read`.
- `backend/src/controllers/notifController.js:67` emits unread counts.

Delete:

- `backend/src/controllers/notifController.js:80` starts `deleteNotif`.
- `backend/src/controllers/notifController.js:83` reads user ID from JWT.
- `backend/src/controllers/notifController.js:90` searches by notification ID and user ID.
- `backend/src/controllers/notifController.js:97` remembers whether it was unread.
- `backend/src/controllers/notifController.js:99` deletes it.
- `backend/src/controllers/notifController.js:103` emits unread counts only if needed.

Important authorization concept:

> The browser never chooses which user's notifications are accessed. The backend uses `req.user.id` from the JWT.

## 11. Where Notifications Are Produced

Notifications are side effects of real actions.

Message example:

- `backend/src/controllers/messageController.js:405` loads message recipients.
- `backend/src/controllers/messageController.js:419` loops over recipients.
- `backend/src/controllers/messageController.js:421` calls `createNotificationIfRelevant`.
- `backend/src/controllers/messageController.js:422` sets recipient user ID.
- `backend/src/controllers/messageController.js:423` sets actor to the sender.
- `backend/src/controllers/messageController.js:424` uses `NOTIFICATION_TYPES.MESSAGE`.

Post and friend actions use the same service pattern in their controllers. The important idea is that the notification controller does not invent notifications; feature controllers create notifications after their own database action succeeds.

## 12. Unread Counts

Unread notification count is computed in `backend/src/services/inboxService.js`:

- `backend/src/services/inboxService.js:52` starts `getUnreadNotificationsCount`.
- `backend/src/services/inboxService.js:59` counts notification rows.
- `backend/src/services/inboxService.js:61` filters by user.
- `backend/src/services/inboxService.js:62` filters `read: false`.

Combined inbox counts:

- `backend/src/services/inboxService.js:67` starts `getInboxUnreadCounts`.
- `backend/src/services/inboxService.js:77` fetches message and notification counts together.
- `backend/src/services/inboxService.js:82` returns `unreadMessagesCount`.
- `backend/src/services/inboxService.js:84` returns `unreadNotificationsCount`.

Live emit:

- `backend/src/services/inboxService.js:88` starts `emitInboxUnreadCounts`.
- `backend/src/services/inboxService.js:96` calculates counts.
- `backend/src/services/inboxService.js:98` gets Socket.io.
- `backend/src/services/inboxService.js:99` targets the user's private room.
- `backend/src/services/inboxService.js:100` emits `inbox:unread-counts`.

## 13. Frontend API Types

Notification socket and REST payloads reuse frontend API types.

Socket event types:

- `frontend/lib/socket-events.ts:32` defines `NotificationCreatedEvent`.
- `frontend/lib/socket-events.ts:33` includes a `NotificationItem`.
- `frontend/lib/socket-events.ts:36` defines `NotificationReadEvent`.
- `frontend/lib/socket-events.ts:37` includes `notificationId`.
- `frontend/lib/socket-events.ts:40` defines `NotificationDeletedEvent`.
- `frontend/lib/socket-events.ts:41` includes `notificationId`.

This lets socket handlers know the payload shape.

## 14. Frontend Notification Page State

Main page file: `frontend/app/(app)/notifications/page.tsx`.

Setup:

- `frontend/app/(app)/notifications/page.tsx:38` starts `NotificationsPage`.
- `frontend/app/(app)/notifications/page.tsx:39` reads auth token.
- `frontend/app/(app)/notifications/page.tsx:41` reads socket and connection state.
- `frontend/app/(app)/notifications/page.tsx:42` gets global unread-count setter.
- `frontend/app/(app)/notifications/page.tsx:45` stores notification list.
- `frontend/app/(app)/notifications/page.tsx:46` stores loading state.
- `frontend/app/(app)/notifications/page.tsx:47` stores error state.
- `frontend/app/(app)/notifications/page.tsx:48` stores search text.
- `frontend/app/(app)/notifications/page.tsx:49` stores filters.
- `frontend/app/(app)/notifications/page.tsx:50` stores mark-all loading state.

Why this page owns list state:

- It renders the ledger.
- It applies filters and grouping.
- It handles optimistic read updates.
- Toasts are temporary and do not own durable state.

## 15. Frontend Initial Fetch

Fetch function:

- `frontend/app/(app)/notifications/page.tsx:52` defines `fetchNotifications`.
- `frontend/app/(app)/notifications/page.tsx:54` does nothing without token.
- `frontend/app/(app)/notifications/page.tsx:61` sets loading.
- `frontend/app/(app)/notifications/page.tsx:62` clears previous error.
- `frontend/app/(app)/notifications/page.tsx:64` calls `getNotifications(token)`.
- `frontend/app/(app)/notifications/page.tsx:66` checks API failure.
- `frontend/app/(app)/notifications/page.tsx:70` stores returned notifications.
- `frontend/app/(app)/notifications/page.tsx:73` catches errors.
- `frontend/app/(app)/notifications/page.tsx:80` optionally shows a toast.
- `frontend/app/(app)/notifications/page.tsx:84` clears loading.

Initial effect:

- `frontend/app/(app)/notifications/page.tsx:90` starts the effect.
- `frontend/app/(app)/notifications/page.tsx:95` fetches on page load.

Why:

- REST provides the full durable history.
- Sockets only update after the page is already open.

## 16. Frontend Unread Count Sync

Local unread count:

- `frontend/app/(app)/notifications/page.tsx:98` derives `unreadCount`.
- `frontend/app/(app)/notifications/page.tsx:99` filters unread notifications.

Global sidebar sync:

- `frontend/app/(app)/notifications/page.tsx:103` starts effect.
- `frontend/app/(app)/notifications/page.tsx:104` waits until loading is complete.
- `frontend/app/(app)/notifications/page.tsx:108` writes the unread count into `InboxUnreadContext`.

The context itself:

- `frontend/context/InboxUnreadContext.tsx:41` stores unread notifications count.
- `frontend/context/InboxUnreadContext.tsx:52` can refresh it from REST.
- `frontend/context/InboxUnreadContext.tsx:94` handles live unread-count payloads.
- `frontend/context/InboxUnreadContext.tsx:118` subscribes to `inbox:unread-counts`.

## 17. Frontend Live Notification Events

Created event:

- `frontend/app/(app)/notifications/page.tsx:111` defines created handler.
- `frontend/app/(app)/notifications/page.tsx:113` normalizes uploaded media URLs in the payload.
- `frontend/app/(app)/notifications/page.tsx:115` updates notification state.
- `frontend/app/(app)/notifications/page.tsx:116` deduplicates by ID.
- `frontend/app/(app)/notifications/page.tsx:120` prepends the new notification.

Read event:

- `frontend/app/(app)/notifications/page.tsx:125` defines read handler.
- `frontend/app/(app)/notifications/page.tsx:127` maps current notifications.
- `frontend/app/(app)/notifications/page.tsx:129` finds the target notification.
- `frontend/app/(app)/notifications/page.tsx:130` sets `read: true`.

Deleted event:

- `frontend/app/(app)/notifications/page.tsx:137` defines deleted handler.
- `frontend/app/(app)/notifications/page.tsx:139` filters current notifications.
- `frontend/app/(app)/notifications/page.tsx:140` removes the deleted ID.

Subscription:

- `frontend/app/(app)/notifications/page.tsx:301` starts the socket effect.
- `frontend/app/(app)/notifications/page.tsx:302` exits if no socket.
- `frontend/app/(app)/notifications/page.tsx:318` subscribes to `notification:created`.
- `frontend/app/(app)/notifications/page.tsx:319` subscribes to `notification:read`.
- `frontend/app/(app)/notifications/page.tsx:320` subscribes to `notification:deleted`.
- `frontend/app/(app)/notifications/page.tsx:322` starts cleanup.
- `frontend/app/(app)/notifications/page.tsx:323` removes created listener.
- `frontend/app/(app)/notifications/page.tsx:324` removes read listener.
- `frontend/app/(app)/notifications/page.tsx:325` removes deleted listener.

Reconnect:

- `frontend/app/(app)/notifications/page.tsx:329` starts reconnect effect.
- `frontend/app/(app)/notifications/page.tsx:330` requires token and connection.
- `frontend/app/(app)/notifications/page.tsx:334` refetches without showing an error toast.

Why reconnect refetch:

- Socket events can be missed while disconnected.
- REST rebuilds the current truth from the database.

## 18. Mark As Read And Mark All

Core function:

- `frontend/app/(app)/notifications/page.tsx:181` starts `handleMarkNotificationsAsRead`.
- `frontend/app/(app)/notifications/page.tsx:186` filters requested IDs down to unread local notifications.
- `frontend/app/(app)/notifications/page.tsx:198` stores previous state for rollback.
- `frontend/app/(app)/notifications/page.tsx:201` optimistically marks selected notifications read.
- `frontend/app/(app)/notifications/page.tsx:209` starts parallel API calls.
- `frontend/app/(app)/notifications/page.tsx:211` calls `markNotificationAsRead(notificationId, token)`.
- `frontend/app/(app)/notifications/page.tsx:215` detects failed responses.
- `frontend/app/(app)/notifications/page.tsx:223` prepares confirmed server updates.
- `frontend/app/(app)/notifications/page.tsx:233` merges confirmed updates.
- `frontend/app/(app)/notifications/page.tsx:239` rolls back on error.

Single card:

- `frontend/app/(app)/notifications/page.tsx:244` starts `handleMarkAsRead`.
- `frontend/app/(app)/notifications/page.tsx:246` delegates to the core function with one ID.

Group:

- `frontend/app/(app)/notifications/page.tsx:256` starts `handleMarkGroupAsRead`.
- `frontend/app/(app)/notifications/page.tsx:258` delegates with many IDs.

Mark all:

- `frontend/app/(app)/notifications/page.tsx:268` starts `handleMarkAllAsRead`.
- `frontend/app/(app)/notifications/page.tsx:273` collects unread IDs.
- `frontend/app/(app)/notifications/page.tsx:283` marks all unread IDs.
- `frontend/app/(app)/notifications/page.tsx:285` shows success toast.

Concept:

> Optimistic update means the UI marks items read immediately, then rolls back if the server rejects the request.

## 19. Filtering, Searching, And Rendering

The page builds a ledger:

- `frontend/app/(app)/notifications/page.tsx:145` creates `ledgerItems`.
- `frontend/app/(app)/notifications/page.tsx:146` calls `buildNotificationLedgerItems(notifications)`.
- `frontend/app/(app)/notifications/page.tsx:150` creates visible ledger items.
- `frontend/app/(app)/notifications/page.tsx:151` normalizes search text.
- `frontend/app/(app)/notifications/page.tsx:154` applies category filters.
- `frontend/app/(app)/notifications/page.tsx:162` applies search text.

Filter toggle:

- `frontend/app/(app)/notifications/page.tsx:166` starts `handleToggleFilter`.
- `frontend/app/(app)/notifications/page.tsx:168` builds next filter state.
- `frontend/app/(app)/notifications/page.tsx:173` prevents disabling every filter.

Rendering:

- `frontend/app/(app)/notifications/page.tsx:413` maps visible ledger items.
- `frontend/app/(app)/notifications/page.tsx:415` chooses grouped-like card.
- `frontend/app/(app)/notifications/page.tsx:423` chooses normal notification card.
- `frontend/app/(app)/notifications/page.tsx:440` renders the notifications rail.

## 20. Global Notification Toasts

File: `frontend/components/layout/LiveInboxToasts.tsx`.

Notification toast handling:

- `frontend/components/layout/LiveInboxToasts.tsx:63` defines notification-created toast handler.
- `frontend/components/layout/LiveInboxToasts.tsx:65` normalizes the notification payload.
- `frontend/components/layout/LiveInboxToasts.tsx:67` suppresses toasts on `/notifications`.
- `frontend/components/layout/LiveInboxToasts.tsx:71` suppresses `MESSAGE` notification toasts.
- `frontend/components/layout/LiveInboxToasts.tsx:75` creates the toast.
- `frontend/components/layout/LiveInboxToasts.tsx:77` uses a 5-second duration.
- `frontend/components/layout/LiveInboxToasts.tsx:79` sends metadata to the toaster.
- `frontend/components/layout/LiveInboxToasts.tsx:81` includes the full notification.
- `frontend/components/layout/LiveInboxToasts.tsx:101` subscribes to `notification:created`.
- `frontend/components/layout/LiveInboxToasts.tsx:105` removes the listener on cleanup.

Why suppress `MESSAGE`:

- Sending a direct message creates both a message event and a `MESSAGE` notification row.
- The message event already creates a message toast.
- Showing both would duplicate user feedback.

## 21. Full Flow: Someone Likes Your Post

1. The actor clicks like.
2. The post controller creates a `Like` row.
3. The post controller calls `createNotificationIfRelevant(...)`.
4. `createNotificationIfRelevant(...)` rejects self-notifications (`backend/src/services/notificationService.js:156`).
5. `createNotification(...)` writes the `Notification` row (`backend/src/services/notificationService.js:50`).
6. Backend emits `notification:created` to the recipient room (`backend/src/services/notificationService.js:61` to `backend/src/services/notificationService.js:64`).
7. Backend emits refreshed unread counts (`backend/src/services/notificationService.js:67`).
8. If the recipient has `/notifications` open, the page prepends the notification (`frontend/app/(app)/notifications/page.tsx:115` to `frontend/app/(app)/notifications/page.tsx:120`).
9. The sidebar unread badge updates through `InboxUnreadContext` (`frontend/context/InboxUnreadContext.tsx:94` to `frontend/context/InboxUnreadContext.tsx:97`).
10. If the recipient is not on `/notifications`, `LiveInboxToasts` shows a toast (`frontend/components/layout/LiveInboxToasts.tsx:75`).

## 22. Full Flow: You Open A Notification

1. The card calls the page's `onMarkAsRead`.
2. The page runs `handleMarkNotificationsAsRead(...)` (`frontend/app/(app)/notifications/page.tsx:181`).
3. The UI optimistically sets `read: true` (`frontend/app/(app)/notifications/page.tsx:201` to `frontend/app/(app)/notifications/page.tsx:207`).
4. Frontend calls `PATCH /notifications/:id/read` (`frontend/app/(app)/notifications/page.tsx:209` to `frontend/app/(app)/notifications/page.tsx:212`).
5. Backend confirms the notification belongs to the JWT user (`backend/src/controllers/notifController.js:49` to `backend/src/controllers/notifController.js:54`).
6. Backend updates `read: true` (`backend/src/controllers/notifController.js:57` to `backend/src/controllers/notifController.js:60`).
7. Backend emits `notification:read` (`backend/src/controllers/notifController.js:63` to `backend/src/controllers/notifController.js:66`).
8. Backend emits unread counts (`backend/src/controllers/notifController.js:67`).
9. Other open tabs mark the same notification read (`frontend/app/(app)/notifications/page.tsx:125` to `frontend/app/(app)/notifications/page.tsx:133`).

## 23. Current Limitations

Be precise during evaluation:

- `MENTION` is supported as a type but not currently produced by backend logic.
- Manual delete through `DELETE /notifications/:id` refreshes unread counts but does not currently emit `notification:deleted` from `notifController.js`.
- Undo-action deletes through `deleteNotificationIfExists(...)` do emit `notification:deleted`.
- Mark all is implemented as multiple single-notification PATCH calls, not a backend batch endpoint.
- Notifications cover our social/feed/message actions, not every possible database update in the app.

## 24. Common Evaluation Questions

### Why return 403 from `POST /notifications`?

Because notifications must be created by real backend events, not forged directly by clients.

### Why do we store notifications in the database if we already use sockets?

Sockets only reach connected clients. Database rows provide history, unread state, reload recovery, and evaluation-demonstrable persistence.

### Why does the frontend deduplicate created notifications?

REST refetch and socket events can overlap. The check at `frontend/app/(app)/notifications/page.tsx:116` prevents duplicate cards.

### How do we stop users from marking someone else's notification read?

The backend looks up the row with both `id` and `userId` from the JWT at `backend/src/controllers/notifController.js:49` to `backend/src/controllers/notifController.js:50`.

### Why have both `notification:created` and `inbox:unread-counts`?

`notification:created` updates the notification list. `inbox:unread-counts` updates global sidebar badges with authoritative totals.

## 25. Self-Check

- Can I explain recipient vs actor?
- Can I list the notification types we support?
- Can I explain why self-notifications are skipped?
- Can I explain why action undo deletes matching notifications?
- Can I explain the three frontend notification states: list, unread count, toast?
- Can I explain optimistic mark-as-read and rollback?
- Can I explain why reconnect refetches notification data?
- Can I explain the current limitations without overstating the module?
