# 4c. WebSockets and Socket.io

Goal: be able to explain the real-time architecture we actually implemented in this repo, from backend bootstrap to frontend live updates.

This lesson covers the current codebase, not a generic Socket.io tutorial.

## 1. Why We Added WebSockets

The subject requires:

- a basic chat system
- efficient message broadcasting

In our implementation:

- REST remains the source of truth for loading data and writing data
- Socket.io is the live update layer on top
- socket emits are best-effort and should never make a successful DB write fail

That split is important.

We do **not** use sockets to replace normal API endpoints.
We use sockets to avoid stale UI after a successful backend action.

Real examples from our app:

- new direct messages should appear live
- sidebar unread counts should update live
- notifications page should receive new notifications live
- marking things as read in one tab should update the other tabs

## 2. Files That Matter

Backend:

- `backend/src/server.js`
- `backend/src/socket.js`
- `backend/src/socketEvents.js`
- `backend/src/services/inboxService.js`
- `backend/src/services/notificationService.js`
- `backend/src/controllers/messageController.js`
- `backend/src/controllers/notifController.js`
- `backend/src/middleware/auth.js`

Frontend:

- `frontend/context/SocketContext.tsx`
- `frontend/context/InboxUnreadContext.tsx`
- `frontend/hooks/useMessages.ts`
- `frontend/app/(app)/notifications/page.tsx`
- `frontend/components/layout/AppSidebarShell.tsx`
- `frontend/components/layout/LiveInboxToasts.tsx`
- `frontend/lib/socket-events.ts`

Dependency:

- `frontend/package.json` now includes `socket.io-client`

## 3. High-Level Architecture

The real-time flow is:

```text
Browser
  -> Next.js frontend
  -> Socket.io client
  -> backend Node HTTP server
  -> Socket.io server
  -> Express + Prisma writes
  -> socket emits back to user rooms
```

Mental model:

- Express handles HTTP routes
- Node HTTP server owns the actual port
- Socket.io attaches to that HTTP server
- frontend creates one shared authenticated socket connection
- specific frontend state owners subscribe to the events they care about

## 4. Why `app.listen(...)` Was Replaced

Before sockets, the backend could end with:

```js
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

After adding sockets, `backend/src/server.js` does:

```js
const httpServer = createServer(app);
attachSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Why:

- `app` is the Express application
- `httpServer` is the real Node HTTP server
- Socket.io must attach to the HTTP server, not directly to the Express app

This is because a WebSocket connection starts with an HTTP handshake and then upgrades.

Short evaluator answer:

- `app.listen(...)` is the Express convenience helper
- `createServer(app)` gives access to the underlying Node server
- Socket.io needs that server to handle the handshake and persistent connection

## 5. What `backend/src/socket.js` Does

This file centralizes socket setup.

Current exports:

- `attachSocketServer(httpServer)`
- `getSocketServer()`
- `getUserRoomName(userId)`

### `attachSocketServer(httpServer)`

Responsibilities:

- create the Socket.io server once
- configure CORS
- install socket authentication middleware
- register the connection handler

Real code shape:

```js
io = new Server(httpServer, {
  cors: {
    origin: getEnv("FRONTEND_URL"),
    credentials: true,
  },
});
```

Why singleton setup matters:

- we want exactly one Socket.io server attached to the backend
- later controllers can safely call `getSocketServer()`

### `getSocketServer()`

Purpose:

- let other backend files emit events without recreating Socket.io

Example use:

- `messageController.js` emits live message events
- `notificationService.js` emits notification events
- `inboxService.js` emits unread-count events

### `getUserRoomName(userId)`

Real code:

```js
export function getUserRoomName(userId) {
  return `user:${userId}`;
}
```

Why we use a helper:

- prevents hardcoded room-string typos
- gives one canonical private room format
- makes the room contract easier to explain

## 6. Socket Authentication

We reused the same JWT model as REST.

That means:

- login creates the app JWT in `backend/src/controllers/userController.js`
- OAuth creates the same app JWT in `backend/src/controllers/oauthController.js`
- REST verifies it in `backend/src/middleware/auth.js`
- Socket.io verifies it in `backend/src/socket.js`

This is better than creating a second auth system just for sockets.

### Socket Middleware

The key line is:

```js
io.use((socket, next) => {
  ...
});
```

This is Socket.io middleware.

Role:

- runs before the connection is accepted
- can reject the socket
- can attach trusted data to `socket.data`

In our implementation, the middleware:

1. extracts the token
2. verifies it with `JWT_SECRET`
3. stores the decoded user payload in `socket.data.user`
4. calls `next()` if valid
5. calls `next(new Error(...))` if invalid

Real code:

```js
io.use((socket, next) => {
  const token = extractSocketToken(socket);

  if (!token) {
    next(new Error("Authentication required."));
    return;
  }

  try {
    const user = jwt.verify(token, getEnv("JWT_SECRET"));
    socket.data.user = user;
    next();
  } catch {
    next(new Error("Invalid token."));
  }
});
```

### Why `extractSocketToken(...)` Exists

The helper accepts two handshake patterns:

1. `socket.handshake.auth.token`
2. `Authorization` header, including `Bearer <token>`

Why this is useful:

- keeps middleware small
- separates token parsing from token verification
- makes client integration more flexible

### `req.user` vs `socket.data.user`

REST:

- token verified
- decoded user stored in `req.user`

Socket.io:

- token verified during handshake
- decoded user stored in `socket.data.user`

These are the same idea in two different transports.

## 7. Connection Handler and User Rooms

After middleware accepts a connection, we run:

```js
io.on("connection", (socket) => {
  const userId = Number(socket.data.user?.id);

  if (!Number.isInteger(userId) || userId < 1) {
    socket.disconnect(true);
    return;
  }

  socket.join(getUserRoomName(userId));
});
```

This means every authenticated socket joins its own private room:

- `user:1`
- `user:42`
- etc.

Why this matters:

- a user may have multiple tabs open
- we want one backend emit to reach all of that user’s active sockets
- we do not want to broadcast private events globally

This is our first routing primitive for real-time data.

## 8. Event Names We Use

Backend event names are centralized in:

- `backend/src/socketEvents.js`

Frontend event names and payload types are mirrored in:

- `frontend/lib/socket-events.ts`

Current events:

- `inbox:unread-counts`
- `message:created`
- `conversation:read`
- `notification:created`
- `notification:read`
- `presence:online-users`

These are intentionally few.
We only added events the UI actually uses.

### Online Presence Event Contract

For message UI presence badges, we added one shared payload:

```ts
type OnlineUsersEvent = {
  onlineUserIds: number[];
};
```

Backend emits this from `backend/src/socket.js` on every connect/disconnect:

```js
io.emit(SOCKET_EVENTS.ONLINE_USERS, {
  onlineUserIds: [...userSocketCounts.keys()],
});
```

Frontend consumes it in `frontend/context/SocketContext.tsx` and exposes `onlineUserIds` through context.

Why this contract is easy to explain:

- one event gives the whole online snapshot
- message UI only needs `Set.has(peerId)` to paint presence state:
- `frontend/components/messages/ConversationRail.tsx` shows green/gray dots in the conversation list
- `frontend/components/messages/ConversationThread.tsx` shows an Online/Offline pill in the header
- no polling is required

## 9. Unread Count Service

Unread counts are shared state used by the sidebar and multiple pages, so we gave them a dedicated backend service:

- `backend/src/services/inboxService.js`

It provides:

- `getUnreadMessagesCount(userId)`
- `getUnreadNotificationsCount(userId)`
- `getInboxUnreadCounts(userId)`
- `emitInboxUnreadCounts(userId)`

### Why a Dedicated Service?

Without this service, unread-count logic would be duplicated in:

- message controller
- notification controller
- notification service

That would be fragile and hard to explain.

With `inboxService.js`, all those places call the same unread-count emitter.

### How Message Unread Count Works

`getUnreadMessagesCount(userId)`:

1. loads all `ConversationMember` rows for that user
2. reads each `lastReadMessageId`
3. counts messages in each conversation where:
   - sender is not the current user
   - message ID is greater than `lastReadMessageId` when that value exists
4. sums all those counts

This matches the database design we already chose for chat:

- read state lives in `ConversationMember.lastReadMessageId`
- not on each individual message

### What `emitInboxUnreadCounts(userId)` Does

It calculates both unread totals and emits:

```js
socketServer
  .to(getUserRoomName(userId))
  .emit(SOCKET_EVENTS.INBOX_UNREAD_COUNTS, counts);
```

That makes the sidebar badge update live in every open tab of that user.

## 10. Notification Real-Time Flow

Notification creation is centralized in:

- `backend/src/services/notificationService.js`

That was the right place to attach live emits, because many features call it:

- follows
- unfollows
- follow acceptance
- likes
- comments
- direct messages

### On Notification Creation

`createNotification(...)` now:

1. writes the notification in Prisma
2. serializes it
3. emits `notification:created` to the recipient user room
4. emits `inbox:unread-counts` for the recipient

Real shape:

```js
getSocketServer()
  .to(getUserRoomName(userId))
  .emit(SOCKET_EVENTS.NOTIFICATION_CREATED, {
    notification: serializeNotification(notification),
  });

await emitInboxUnreadCounts(userId);
```

Important implementation detail:

- the real-time emit path is wrapped defensively
- if socket emission fails, the notification row is still kept in the database
- we log the socket error, but we do not turn the whole mutation into a failed request

### On Notification Read

`backend/src/controllers/notifController.js` now:

- marks the DB row as read
- emits `notification:read`
- emits updated unread counts

Why:

- unread badge must shrink live
- notifications page in other tabs must reflect the read state

### On Notification Delete

There are two delete paths to know:

- `backend/src/controllers/notifController.js` deletes a notification when the recipient clicks delete in the notification UI.
- `backend/src/services/notificationService.js` deletes a generated notification when the original action is undone, for example unliking a post.

When `deleteNotificationIfExists(...)` is used, it emits:

```js
getSocketServer()
  .to(getUserRoomName(recipientId))
  .emit(SOCKET_EVENTS.NOTIFICATION_DELETED, { notificationId: match.id });
```

The notifications page listens to `notification:deleted` and removes the item from local state.

Important limitation:

- direct `DELETE /notifications/:id` refreshes unread counts if needed
- action-undo deletion through `deleteNotificationIfExists(...)` emits `notification:deleted`
- if the user deletes a notification manually from one tab, the current controller does not emit `notification:deleted` for the other tabs

## 11. Message Real-Time Flow

The message logic is in:

- `backend/src/controllers/messageController.js`

### Helper Functions Added There

We added:

- `getSerializedConversationForUser(conversationId, currentUserId)`
- `emitMessageCreated({ conversationId, message, participantUserIds })`
- `emitConversationRead({ conversationId, userId, unreadCount })`

Why:

- a message event needs both the new message and the updated conversation summary
- each participant sees the conversation differently because:
  - `peer` differs depending on current user
  - `unreadCount` differs depending on who has read the conversation

So we do not emit one raw DB object to everybody.
We build a user-specific serialized conversation snapshot.

### On `POST /conversations/:id/messages`

After a successful message write, the controller now:

1. creates the message in a transaction
2. updates `conversation.lastMessageAt`
3. updates the sender’s `lastReadMessageId`
4. creates message notifications for recipients
5. emits `message:created` to every participant user room

The event payload is:

```text
{
  conversation: ConversationItem,
  message: ConversationMessage
}
```

Why emit to every participant:

- recipient needs the live incoming message
- sender’s other open tabs also need to stay in sync

Important robustness rule:

- the message write succeeds first
- socket emission is best-effort afterward
- a live-update failure must not make the endpoint lie about the DB write

### On `POST /conversations/:id/read`

After the DB updates `lastReadMessageId`, the controller now:

1. emits `conversation:read` to that user room
2. emits refreshed unread counts for that user

Why:

- other tabs of the same user should clear unread state too
- sidebar badge should shrink immediately

We do **not** yet emit “seen by other participant” receipts.
That was an intentional scope decision.

## 12. Frontend Socket Setup

The shared client connection lives in:

- `frontend/context/SocketContext.tsx`

### What `SocketProvider` Does

It:

- reads the JWT from `AuthContext`
- creates one authenticated Socket.io client connection
- exposes:
  - `socket`
  - `isConnected`

Real shape:

```tsx
const nextSocket = io(API_URL, {
  auth: {
    token,
  },
});
```

Why this provider exists:

- only one socket connection should exist per app shell
- child hooks/components should subscribe through context
- it keeps connection lifecycle separate from page logic

### Where It Is Mounted

`frontend/components/layout/AppSidebarShell.tsx` now wraps the app pages like this:

```tsx
<SocketProvider key={token ?? "anonymous"}>
  <InboxUnreadProvider>
    <AppSidebarShellContent>{children}</AppSidebarShellContent>
  </InboxUnreadProvider>
</SocketProvider>
```

This is important:

- `SocketProvider` must be inside `AuthProvider`, because it needs the JWT
- `InboxUnreadProvider` must be inside `SocketProvider`, because it listens to socket events

## 13. Live Sidebar Badge Updates

The sidebar does **not** talk to Socket.io directly.

The state owner is:

- `frontend/context/InboxUnreadContext.tsx`

That context already owned:

- unread notifications count
- unread messages count

So it was the correct place to subscribe to:

- `inbox:unread-counts`

### What Changed There

The context now:

- keeps the initial REST refresh logic as fallback
- listens to socket unread-count events
- refreshes from REST when the socket reconnects

Why keep both socket and REST:

- sockets are for live updates
- REST is still needed for cold start and recovery after missed events

This is an important evaluation point:

- WebSockets improve freshness
- REST still rebuilds the correct state after refresh or reconnect

## 14. Live Message Page Updates

The message page state owner is:

- `frontend/hooks/useMessages.ts`

That hook already owned:

- conversations list
- selected conversation
- messages cache
- send/read behavior

So it is the correct place to subscribe to:

- `message:created`
- `conversation:read`

### What Happens On `message:created`

The hook now:

1. upserts the conversation summary in the rail
2. appends the message into the cache, deduplicated by message ID
3. updates the visible thread if that conversation is currently selected

Why deduplication matters:

- the sending tab gets the REST response
- the same tab may also receive the socket event
- without dedupe, the sender could see duplicate bubbles

### What Happens On `conversation:read`

The hook updates `conversation.unreadCount` locally.

That lets multiple tabs of the same user stay in sync when one tab opens or reads a conversation.

### What Happens On Reconnect

When the socket reconnects, the hook refetches:

- conversations list
- current conversation messages if one is selected

Why:

- socket events can be missed while disconnected
- reconnect is a good moment to rebuild message state from REST

## 15. Live Notifications Page Updates

The notifications page state owner is:

- `frontend/app/(app)/notifications/page.tsx`

That page now listens to:

- `notification:created`
- `notification:read`

### On `notification:created`

The page prepends the new notification if it is not already present.

Why the duplicate guard matters:

- the page may also refetch later
- we do not want duplicate cards

### On `notification:read`

The page marks the matching item as `read: true` locally.

This keeps multiple tabs aligned when one tab reads a notification.

### On Reconnect

The page silently refetches notifications when the socket reconnects.

Why:

- it is the simplest recovery path after missed events

## 16. Why We Chose This Design

Main architectural choices:

- one authenticated socket connection per app shell
- one private room per user
- event subscriptions placed in the actual state owner
- a separate passive toast listener for transient UI feedback
- REST still owns initial load and recovery
- minimal event list instead of event spam

### Why `LiveInboxToasts.tsx` Is Separate

The global toast listener now lives in:

- `frontend/components/layout/LiveInboxToasts.tsx`

It listens to:

- `message:created`
- `notification:created`

But it does **not** own durable state.

That separation is intentional:

- `useMessages.ts` owns message data
- `notifications/page.tsx` owns notification data
- `InboxUnreadContext.tsx` owns sidebar badge counts
- `LiveInboxToasts.tsx` only turns socket events into temporary toasts

This is a good evaluation point:

- a toast is UI feedback, not source-of-truth state
- so it should not replace the real state owner

Current route guards:

- message toasts are suppressed on `/message`
- notification toasts are suppressed on `/notifications`
- `MESSAGE` notifications do not create a second toast because chat toasts already use `message:created`

Why:

- if the user is already on the page that visibly receives the live update, the extra toast is redundant noise
- for direct messages, one backend action produces both a message event and a notification row, so we intentionally avoid duplicate UI feedback

### Why Toasts Send Metadata Instead of Final Text Only

`LiveInboxToasts.tsx` now sends a `meta` payload into the shared Ark toaster:

- notification toasts send the full `notification`
- message toasts send the `conversation` summary plus the new `message`

Why:

- the toaster can render notification toasts like a compact `NotificationCard`
- the toaster can render message toasts like a compact `ConversationRail` item
- the state owner still stays the same, but the renderer has enough real data to choose the right visual treatment

This is the important distinction:

- socket listeners decide **whether** to show a toast
- the toaster decides **how** that toast should look

Current behavior:

- notification toasts auto-dismiss after 5 seconds
- message toasts persist until the user dismisses them
- clicking a notification toast opens the same href as the corresponding notification card
- clicking a message toast opens `/message?userId=<peerId>`

This is a good evaluation answer because it shows:

- separation of concerns
- consistency with our existing React state ownership
- consistency with our JWT auth system

## 17. What Is Implemented vs Not Implemented

Implemented:

- backend Socket.io bootstrap
- socket JWT auth
- per-user rooms
- live unread count updates
- live incoming message updates
- live notification creation updates
- multi-tab synchronization for conversation read and notification read
- reconnect refetch on the main real-time state owners

Not implemented:

- participant-to-participant seen receipts
- conversation room joins like `conversation:<id>`
- typing indicators
- live manual-notification deletion synchronization from `DELETE /notifications/:id`

Those are conscious scope boundaries, not forgotten basics.

## 18. Common Evaluation Questions

### Why keep REST if we already have WebSockets?

Because REST is still the source of truth for loading and writing data. WebSockets only push freshness between those fetches.

### Why not broadcast every event globally?

Because messages and notifications are private user-scoped events. Per-user rooms are safer and more efficient.

### Why use a room if we only have direct messages?

Because a room lets one emit reach all active tabs of the same user without manually tracking socket IDs.

### Why does the message event include both `conversation` and `message`?

Because the rail needs updated conversation metadata and the thread needs the actual new message.

### Why not store unread state directly in each message?

Because our design uses `ConversationMember.lastReadMessageId`, which is cheaper and cleaner for conversation-level unread counts.

### What is the socket equivalent of `req.user`?

`socket.data.user`

### What is the socket equivalent of Express auth middleware?

`io.use(...)` in `backend/src/socket.js`

## 19. Self-Check Questions

- Can I explain why Socket.io attaches to the Node HTTP server and not directly to the Express app?
- Can I explain what `io.use(...)` does in our code?
- Can I explain why every socket joins `user:<id>`?
- Can I explain what `inboxService.js` centralizes?
- Can I explain the difference between `message:created` and `conversation:read`?
- Can I explain why `InboxUnreadContext` owns unread badge socket subscriptions?
- Can I explain why `useMessages` owns live message socket subscriptions?
- Can I explain why we still refetch on reconnect even though we already have live events?
