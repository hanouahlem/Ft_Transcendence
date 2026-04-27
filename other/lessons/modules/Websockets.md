# WebSockets Module Lesson

Goal: be able to explain our real-time module end to end during evaluation: why we use WebSockets, how Socket.io is attached to Express, how sockets authenticate, how frontend state subscribes to events, and why REST still remains the source of truth.

Source of truth: `other/transcendance.md` says the Web module includes a major module for real-time features with real-time updates, graceful connection/disconnection handling, and efficient broadcasting.

## 1. The Big Idea

Our app uses two communication styles:

- REST for durable operations: load conversations, send messages, mark notifications read, fetch notification history.
- Socket.io for live updates: message arrival, unread badge updates, notification events, online presence.

Evaluation wording:

> REST writes and reloads the database state. Socket.io only pushes changes to already-open clients so the UI does not go stale.

## 2. Backend Startup: Why We Use A Node HTTP Server

Express is created normally, but the final server is a Node HTTP server:

- `backend/src/server.js:19` creates the Express app.
- `backend/src/server.js:55` creates `httpServer` with `createServer(app)`.
- `backend/src/server.js:56` calls `attachSocketServer(httpServer)`.
- `backend/src/server.js:59` listens with `httpServer.listen(...)`.

Why this matters:

- A WebSocket starts as an HTTP handshake.
- Socket.io needs the underlying HTTP server to handle that upgrade.
- `app.listen(...)` would hide that server from our socket setup.

Short answer:

> Express owns routes, Node's HTTP server owns the port, and Socket.io attaches to that HTTP server.

## 3. Backend Socket Singleton

The socket server lives in `backend/src/socket.js`.

Important lines:

- `backend/src/socket.js:6` stores the singleton `io`.
- `backend/src/socket.js:39` starts `attachSocketServer(httpServer)`.
- `backend/src/socket.js:44` creates the Socket.io `Server`.
- `backend/src/socket.js:108` exposes `getSocketServer()` for controllers/services.

Why singleton:

- We attach Socket.io once at startup.
- Later code can emit events without creating another server.
- `getSocketServer()` throws if something tries to emit before startup (`backend/src/socket.js:108`).

## 4. Socket CORS

Socket.io has its own CORS config:

- `backend/src/socket.js:44` creates the server.
- `backend/src/socket.js:45` starts `cors`.
- `backend/src/socket.js:46` uses `FRONTEND_URL`.
- `backend/src/socket.js:47` allows credentials.

Why:

- Browser socket connections are cross-origin in local dev: frontend on port `3000`, backend on port `3001`.
- Socket.io requests still need CORS acceptance.

## 5. Socket Authentication

We use the same JWT auth model as REST.

Token extraction:

- `backend/src/socket.js:13` defines `extractSocketToken(socket)`.
- `backend/src/socket.js:15` checks `socket.handshake.auth.token`.
- `backend/src/socket.js:23` checks the `authorization` header.
- `backend/src/socket.js:32` supports `Bearer <token>`.

Middleware:

- `backend/src/socket.js:51` registers `io.use(...)`.
- `backend/src/socket.js:52` extracts the token.
- `backend/src/socket.js:54` rejects missing tokens.
- `backend/src/socket.js:60` verifies the JWT with `JWT_SECRET`.
- `backend/src/socket.js:61` stores the decoded user in `socket.data.user`.
- `backend/src/socket.js:64` rejects invalid tokens.

REST equivalent:

- REST stores the decoded user on `req.user`.
- Socket.io stores the decoded user on `socket.data.user`.

Evaluator answer:

> `io.use(...)` is the socket equivalent of auth middleware. It runs before the socket connection is accepted.

## 6. Per-User Rooms

We generate private room names here:

- `backend/src/socket.js:9` defines `getUserRoomName(userId)`.
- `backend/src/socket.js:10` returns `user:${userId}`.

On connection:

- `backend/src/socket.js:68` runs the connection handler.
- `backend/src/socket.js:69` reads the authenticated user ID.
- `backend/src/socket.js:71` rejects invalid user IDs.
- `backend/src/socket.js:76` joins the socket to `user:<id>`.

Why rooms:

- One user can have multiple tabs open.
- One emit to `user:42` reaches every active socket for user 42.
- Private messages and notifications are not broadcast globally.

## 7. Presence / Online Users

Presence is tracked in memory:

- `backend/src/socket.js:7` creates `userSocketCounts`.
- `backend/src/socket.js:78` reads the current count for a user.
- `backend/src/socket.js:79` increments it on connect.
- `backend/src/socket.js:82` listens for disconnect.
- `backend/src/socket.js:83` decrements the count.
- `backend/src/socket.js:85` keeps the user online if another tab is still connected.
- `backend/src/socket.js:88` removes the user when their final socket disconnects.

Broadcast:

- `backend/src/socket.js:98` defines `emitOnlineUsers()`.
- `backend/src/socket.js:103` emits `presence:online-users`.
- `backend/src/socket.js:104` sends the current online user IDs.

Important limitation:

- This is in-memory presence.
- It works for one backend process.
- If the app scaled to multiple backend instances, we would need shared presence storage or a Socket.io adapter.

## 8. Event Name Contracts

Backend event names:

- `backend/src/socketEvents.js:1` exports the event object.
- `backend/src/socketEvents.js:2` is `inbox:unread-counts`.
- `backend/src/socketEvents.js:3` is `message:created`.
- `backend/src/socketEvents.js:4` is `conversation:read`.
- `backend/src/socketEvents.js:5` is `notification:created`.
- `backend/src/socketEvents.js:6` is `notification:read`.
- `backend/src/socketEvents.js:7` is `notification:deleted`.
- `backend/src/socketEvents.js:8` is `presence:online-users`.

Frontend mirror:

- `frontend/lib/socket-events.ts:7` exports the same event names.
- `frontend/lib/socket-events.ts:17` defines unread-count payload shape.
- `frontend/lib/socket-events.ts:22` defines message-created payload shape.
- `frontend/lib/socket-events.ts:27` defines conversation-read payload shape.
- `frontend/lib/socket-events.ts:32` defines notification-created payload shape.
- `frontend/lib/socket-events.ts:36` defines notification-read payload shape.
- `frontend/lib/socket-events.ts:40` defines notification-deleted payload shape.
- `frontend/lib/socket-events.ts:44` defines online-users payload shape.

Why mirror them:

- Backend and frontend must agree on exact event strings.
- TypeScript payload types help frontend handlers use the right fields.

## 9. Frontend Socket Provider

The shared client connection is in `frontend/context/SocketContext.tsx`.

Important lines:

- `frontend/context/SocketContext.tsx:15` reads `NEXT_PUBLIC_API_URL` or falls back to localhost.
- `frontend/context/SocketContext.tsx:16` normalizes that API URL to an origin for Socket.io.
- `frontend/context/SocketContext.tsx:24` defines the context value: `socket`, `isConnected`, `onlineUserIds`.
- `frontend/context/SocketContext.tsx:32` starts `SocketProvider`.
- `frontend/context/SocketContext.tsx:33` reads the JWT token from `AuthContext`.
- `frontend/context/SocketContext.tsx:38` opens/closes the socket in a React effect.
- `frontend/context/SocketContext.tsx:43` calls `io(SOCKET_URL, ...)`.
- `frontend/context/SocketContext.tsx:44` sends `{ token }` in the socket auth payload.

Connection state:

- `frontend/context/SocketContext.tsx:49` marks connected and stores the socket.
- `frontend/context/SocketContext.tsx:54` clears state on disconnect.
- `frontend/context/SocketContext.tsx:71` listens for `connect`.
- `frontend/context/SocketContext.tsx:72` listens for `disconnect`.
- `frontend/context/SocketContext.tsx:73` treats `connect_error` like a disconnect.

Cleanup:

- `frontend/context/SocketContext.tsx:76` starts cleanup.
- `frontend/context/SocketContext.tsx:77` removes the `connect` listener.
- `frontend/context/SocketContext.tsx:80` removes the online-users listener.
- `frontend/context/SocketContext.tsx:81` disconnects the socket.

Why cleanup matters:

- React components can unmount/remount.
- Token changes should close the old authenticated connection.
- Without `off(...)`, duplicate event handlers can run.

## 10. Where The Provider Is Mounted

The app shell wraps protected pages with socket and unread providers:

- `frontend/components/layout/AppSidebarShell.tsx:22` reads the auth token.
- `frontend/components/layout/AppSidebarShell.tsx:25` mounts `SocketProvider`.
- `frontend/components/layout/AppSidebarShell.tsx:26` mounts `InboxUnreadProvider` inside it.
- `frontend/components/layout/AppSidebarShell.tsx:27` renders the actual app shell content.

Why the order matters:

- `SocketProvider` needs auth.
- `InboxUnreadProvider` needs `useSocket()`.
- The sidebar reads unread counts later from `useInboxUnread()` (`frontend/components/layout/AppSidebarShell.tsx:41`).

The `key={token ?? "anonymous"}` at `frontend/components/layout/AppSidebarShell.tsx:25` forces a clean remount when login/logout changes the token.

## 11. Frontend Presence Consumption

The backend emits the full online user snapshot.

Frontend handling:

- `frontend/context/SocketContext.tsx:60` defines `handleOnlineUsers`.
- `frontend/context/SocketContext.tsx:61` validates the payload is an array.
- `frontend/context/SocketContext.tsx:65` filters to positive integer IDs.
- `frontend/context/SocketContext.tsx:68` stores them as a `Set<number>`.
- `frontend/context/SocketContext.tsx:74` subscribes to `SOCKET_EVENTS.ONLINE_USERS`.

Why a `Set`:

- UI components can quickly check `onlineUserIds.has(userId)`.
- The frontend does not need duplicate IDs.

## 12. Live Unread Counts

Backend:

- `backend/src/services/inboxService.js:52` counts unread notifications.
- `backend/src/services/inboxService.js:67` combines message and notification counts.
- `backend/src/services/inboxService.js:88` emits unread count updates.
- `backend/src/services/inboxService.js:98` targets the user's private room.
- `backend/src/services/inboxService.js:100` emits `inbox:unread-counts`.

Frontend:

- `frontend/context/InboxUnreadContext.tsx:39` reads auth token.
- `frontend/context/InboxUnreadContext.tsx:40` reads socket state.
- `frontend/context/InboxUnreadContext.tsx:41` stores unread notifications count.
- `frontend/context/InboxUnreadContext.tsx:42` stores unread messages count.
- `frontend/context/InboxUnreadContext.tsx:52` refreshes notification count from REST.
- `frontend/context/InboxUnreadContext.tsx:68` refreshes message count from REST.
- `frontend/context/InboxUnreadContext.tsx:94` handles socket unread-count payloads.
- `frontend/context/InboxUnreadContext.tsx:118` subscribes to `inbox:unread-counts`.
- `frontend/context/InboxUnreadContext.tsx:125` refreshes on reconnect.
- `frontend/context/InboxUnreadContext.tsx:133` refreshes on focus/visibility recovery.

Key explanation:

> Socket events keep the sidebar live; REST refreshes recover correct state after reload, reconnect, or missed events.

## 13. Live Message Flow

Backend message emit:

- `backend/src/controllers/messageController.js:122` defines `emitMessageCreated(...)`.
- `backend/src/controllers/messageController.js:124` serializes the message.
- `backend/src/controllers/messageController.js:127` loops over participant user IDs.
- `backend/src/controllers/messageController.js:129` builds a user-specific conversation snapshot.
- `backend/src/controllers/messageController.js:135` emits to each participant's private room.
- `backend/src/controllers/messageController.js:136` includes the conversation summary.
- `backend/src/controllers/messageController.js:137` includes the new message.

Why user-specific conversation snapshots:

- The same conversation has a different `peer` depending on which user receives it.
- The unread count also differs per user.

Send-message endpoint:

- `backend/src/controllers/messageController.js:336` starts `sendMessage`.
- `backend/src/controllers/messageController.js:369` creates the message inside a transaction.
- `backend/src/controllers/messageController.js:383` updates `lastMessageAt`.
- `backend/src/controllers/messageController.js:390` marks the sender's membership as read up to the new message.
- `backend/src/controllers/messageController.js:405` loads recipient members.
- `backend/src/controllers/messageController.js:419` creates `MESSAGE` notifications for recipients.
- `backend/src/controllers/messageController.js:429` emits the live message event.

Frontend message state:

- `frontend/hooks/useMessages.ts:36` starts the hook.
- `frontend/hooks/useMessages.ts:38` reads the socket connection.
- `frontend/hooks/useMessages.ts:39` stores conversations.
- `frontend/hooks/useMessages.ts:40` stores current messages.
- `frontend/hooks/useMessages.ts:61` upserts a conversation into the rail.
- `frontend/hooks/useMessages.ts:68` appends a message into the cache.
- `frontend/hooks/useMessages.ts:71` deduplicates by message ID.
- `frontend/hooks/useMessages.ts:261` handles `message:created`.
- `frontend/hooks/useMessages.ts:265` updates the conversation list.
- `frontend/hooks/useMessages.ts:266` appends the message.
- `frontend/hooks/useMessages.ts:268` updates the visible thread if it is selected.
- `frontend/hooks/useMessages.ts:407` subscribes to `message:created`.

Why dedupe matters:

- The sender gets an HTTP response from `sendConversationMessage(...)`.
- The sender's other tabs and sometimes the same tab can also receive the socket event.
- Deduping prevents duplicate message bubbles.

## 14. Live Read Flow

Backend:

- `backend/src/controllers/messageController.js:146` defines `emitConversationRead(...)`.
- `backend/src/controllers/messageController.js:148` gets the socket server.
- `backend/src/controllers/messageController.js:149` targets the user's room.
- `backend/src/controllers/messageController.js:150` emits `conversation:read`.
- `backend/src/controllers/messageController.js:491` emits after marking a conversation read.
- `backend/src/controllers/messageController.js:496` emits refreshed inbox counts.

Frontend:

- `frontend/hooks/useMessages.ts:228` detects selected unread conversations.
- `frontend/hooks/useMessages.ts:233` calls `markConversationAsRead(...)`.
- `frontend/hooks/useMessages.ts:238` clears local unread count for that conversation.
- `frontend/hooks/useMessages.ts:274` handles socket `conversation:read`.
- `frontend/hooks/useMessages.ts:407` subscribes to `message:created`.
- `frontend/hooks/useMessages.ts:408` subscribes to `conversation:read`.

This syncs unread state across multiple tabs for the same user.

## 15. Live Notification Flow

Backend notification emit:

- `backend/src/services/notificationService.js:49` starts `createNotification(...)`.
- `backend/src/services/notificationService.js:50` creates the database row.
- `backend/src/services/notificationService.js:60` starts best-effort socket emission.
- `backend/src/services/notificationService.js:61` gets the socket server.
- `backend/src/services/notificationService.js:62` targets the recipient room.
- `backend/src/services/notificationService.js:63` emits `notification:created`.
- `backend/src/services/notificationService.js:64` sends the serialized notification.
- `backend/src/services/notificationService.js:67` emits refreshed unread counts.

Frontend notification page:

- `frontend/app/(app)/notifications/page.tsx:41` reads socket state.
- `frontend/app/(app)/notifications/page.tsx:111` handles created notifications.
- `frontend/app/(app)/notifications/page.tsx:115` updates local notification state.
- `frontend/app/(app)/notifications/page.tsx:125` handles read notifications.
- `frontend/app/(app)/notifications/page.tsx:137` handles deleted notifications.
- `frontend/app/(app)/notifications/page.tsx:318` subscribes to `notification:created`.
- `frontend/app/(app)/notifications/page.tsx:319` subscribes to `notification:read`.
- `frontend/app/(app)/notifications/page.tsx:320` subscribes to `notification:deleted`.
- `frontend/app/(app)/notifications/page.tsx:329` refetches on reconnect.

## 16. Global Toast Listener

Live toasts are separate from durable state.

File: `frontend/components/layout/LiveInboxToasts.tsx`

- `frontend/components/layout/LiveInboxToasts.tsx:28` reads the socket.
- `frontend/components/layout/LiveInboxToasts.tsx:32` handles message-created toasts.
- `frontend/components/layout/LiveInboxToasts.tsx:37` suppresses message toasts while on `/message`.
- `frontend/components/layout/LiveInboxToasts.tsx:41` suppresses toasts for messages sent by the current user.
- `frontend/components/layout/LiveInboxToasts.tsx:63` handles notification-created toasts.
- `frontend/components/layout/LiveInboxToasts.tsx:67` suppresses notification toasts while on `/notifications`.
- `frontend/components/layout/LiveInboxToasts.tsx:71` suppresses `MESSAGE` notification toasts because message events already create message toasts.
- `frontend/components/layout/LiveInboxToasts.tsx:100` subscribes to `message:created`.
- `frontend/components/layout/LiveInboxToasts.tsx:101` subscribes to `notification:created`.
- `frontend/components/layout/LiveInboxToasts.tsx:103` cleans up listeners.

Evaluation point:

> Toasts are temporary feedback. They do not replace the state owners: `useMessages`, `NotificationsPage`, and `InboxUnreadContext`.

## 17. Reconnect Strategy

We assume socket events can be missed while offline.

Recovery examples:

- `frontend/context/InboxUnreadContext.tsx:125` refreshes unread counts after reconnect.
- `frontend/hooks/useMessages.ts:416` refreshes conversations after reconnect.
- `frontend/hooks/useMessages.ts:425` refreshes active conversation messages after reconnect.
- `frontend/app/(app)/notifications/page.tsx:329` refetches notifications after reconnect.

Why:

- Socket.io improves freshness.
- REST rebuilds truth from the database.

## 18. What We Implemented

Implemented:

- Socket.io attached to the Express HTTP server.
- JWT authentication during socket handshake.
- Per-user private rooms.
- Multi-tab delivery for the same user.
- Online user presence snapshot.
- Live message creation.
- Live conversation read sync.
- Live notification create/read/delete handling.
- Live unread sidebar badge updates.
- Frontend cleanup with `socket.off(...)`.
- Reconnect recovery through REST refetches.

Not implemented:

- typing indicators
- "seen by the other participant" receipts
- conversation-specific rooms like `conversation:<id>`
- shared presence across multiple backend processes
- guaranteed event replay after long disconnects

## 19. Common Evaluation Questions

### Why use Socket.io instead of raw WebSocket?

Socket.io gives reconnect handling, event names, rooms, and a client library. That fits our project better than manually implementing all of that on raw WebSocket.

### Why not send everything through sockets?

REST is easier to authorize, debug, retry, and use as the durable source of truth. Sockets are best for pushing changes to already-open clients.

### Why private user rooms?

Messages and notifications are private. User rooms also let one emit reach all tabs for the same user.

### What happens if socket emit fails after a database write?

The write remains successful. The UI can recover by REST refetch on reload, focus, or reconnect.

### What is the difference between `socket` and `isConnected` in frontend context?

`socket` is the client object used to subscribe to events. `isConnected` is a boolean state used to trigger recovery logic when the connection comes back.

## 20. Self-Check

- Can I explain why `createServer(app)` is needed?
- Can I explain what `io.use(...)` does?
- Can I explain how the frontend sends the JWT to Socket.io?
- Can I explain why `socket.data.user` is trusted?
- Can I explain why we use `user:<id>` rooms?
- Can I explain how online status survives multiple tabs?
- Can I explain which frontend files subscribe to which events?
- Can I explain why every listener has cleanup?
- Can I explain why reconnect triggers REST refetches?
