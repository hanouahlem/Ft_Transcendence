# Messages Notes (`useMessages`)

File to know:
- `frontend/hooks/useMessages.ts`

Related files:
- `frontend/app/(app)/message/page.tsx` (wiring only)
- `frontend/components/messages/ConversationThread.tsx`
- `frontend/components/messages/ConversationRail.tsx`
- `frontend/components/messages/NewConversationDialog.tsx`
- `frontend/lib/api.ts` (REST calls)

---

## Big Picture

`useMessages` is the state + business logic layer for the message page.

It handles:
- loading conversations
- loading messages of selected conversation
- starting a conversation with a user
- sending messages
- unread handling
- in-memory message cache (per conversation)

The page component does not do business logic anymore. It only connects UI components to this hook.

---

## State You Should Explain

- `conversations`: list shown in the left rail
- `messages`: messages shown in current thread
- `users`: candidates for "new conversation" dialog
- `selectedConversationId`: current thread id
- `draft`: current message input
- `userSearch`: search string in new-conversation dialog
- loading flags:
  - `isLoadingConversations`
  - `isLoadingMessages`
  - `isSending`
  - `isRefreshing`
- dialog flags:
  - `isNewConversationOpen`
  - `isCreatingConversation`

Cache refs:
- `messagesCacheRef: Map<conversationId, ConversationMessage[]>`
- `selectedConversationIdRef`: latest selected id for async safety

Important: cache is in-memory only (React hook lifetime), not persisted.

---

## Function-By-Function Purpose

### `sortConversations(left, right)`
Sorts by most recent activity (`lastMessageAt`, fallback `createdAt`) descending.

Why:
- keep most active conversations on top.

### `loadConversations()`
Calls `GET /conversations`, sorts result, stores it in state, keeps valid selected conversation (or picks first one).

Why:
- initialize and refresh conversation list.

### `loadUsers()`
Calls `GET /users`, filters out current user.

Why:
- feed new-conversation dialog.

### `loadMessages(conversationId, { showLoading })`
Calls `GET /conversations/:id/messages`.
- if `showLoading=true`, toggles message spinner.
- writes response to `messagesCacheRef`.
- only updates visible `messages` if requested `conversationId` is still selected.

Why:
- avoids race condition when user clicks conversations quickly.

### `handleOpenConversation(targetUserId)`
Calls `POST /conversations/direct`.
- creates or reuses 1:1 conversation
- inserts/moves it to top in local list
- sets it selected

Why:
- direct conversation bootstrap from dialog.

### `handleSendMessage()`
Calls `POST /conversations/:id/messages` with current draft.
- clears draft
- appends sent message to current thread
- updates cache for selected conversation
- updates conversation preview + sort order

Why:
- optimistic-feeling local update after successful send.

### `handleRefresh()`
Refreshes conversations, then refreshes selected thread.

Why:
- manual sync action.

### `handleStartConversationFromDialog(targetUserId)`
Dialog-specific wrapper around `handleOpenConversation`.
- sets loading state for clicked user row
- closes dialog and clears search on success

Why:
- clean dialog UX.

---

## Effect-By-Effect Purpose

### Effect: sync `selectedConversationIdRef`
Keeps ref aligned with current selected id.

Why:
- async requests can check latest selected id safely.

### Effect: clear cache on auth identity change
Clears `messagesCacheRef` and resets visible messages when `token/currentUserId` changes.

Why:
- avoid cross-user stale thread data.

### Effect: initial load (`loadConversations` + `loadUsers`)
Runs when token is available.

Why:
- page bootstrap.

### Effect: selected conversation changed
Implements stale-while-revalidate:
- if cache exists: show cached messages immediately, silently refresh in background
- if no cache: clear thread + show loading fetch

Why:
- no loading flash on previously opened conversations.

### Effect: unread -> read
When selected conversation has unread count, calls `POST /conversations/:id/read`, then sets local unread badge to 0.

Why:
- keep unread indicators consistent.

---

## API Endpoints Used

- `POST /conversations/direct`
- `GET /conversations`
- `GET /conversations/:id/messages`
- `POST /conversations/:id/messages`
- `POST /conversations/:id/read`
- `GET /users` (for new conversation dialog)

---

## Evaluation Talking Points (Important)

1. Why no loading flash now:
- because of in-memory message cache + background refresh.

2. Where cache is stored:
- in `useRef(Map)` inside frontend hook, not localStorage.

3. Why use `selectedConversationIdRef`:
- prevents old async response from overwriting current thread.

4. Why unread is updated in an effect:
- opening a conversation should mark it read automatically for UX consistency.

5. Why page was refactored:
- route file is now orchestration only; logic is testable/reasonable in one hook; UI split into focused components.

6. Limits of current implementation:
- cache is volatile (lost on hard refresh/navigation unmount)
- no socket real-time yet (REST-only v1)
- no pagination (intentional for project scope)

---

## Quick Oral Summary (30 seconds)

"`useMessages` is the message feature controller on the frontend. It loads conversations/users, manages selected thread, sends messages, marks reads, and caches messages per conversation in memory. When I switch to a previously opened chat, it renders instantly from cache and silently refreshes in background. The page itself is now thin; visual components are separated from logic."
