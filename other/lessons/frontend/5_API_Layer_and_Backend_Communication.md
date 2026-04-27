# 5. API Layer and Backend Communication

Goal: understand how the frontend centralizes backend calls in `frontend/lib/api.ts`.

## Big Picture

The shared API layer exists so pages and hooks do not all have to rebuild:

- the backend base URL
- auth headers
- JSON parsing
- success vs failure handling
- route names that change during refactors

Main file:

- `frontend/lib/api.ts`

## API Base URL

Real code:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
```

Why it matters:

- the frontend talks to the Express backend on port `3001`
- `NEXT_PUBLIC_...` makes the value available in browser-side code
- local development still works without setting the env because it falls back to `http://localhost:3001`

The same base URL is also used to resolve uploaded media paths returned by the backend.

Real code:

```ts
function resolveUploadUrl(path: string) {
  if (!path.startsWith("/uploads/")) {
    return path;
  }

  return new URL(path, API_URL).toString();
}
```

Why this matters:

- the backend now stores uploaded media as relative `/uploads/...` paths
- dev and eval can point to different public origins without changing database values
- components can keep using ready-to-render `src` values instead of rebuilding URLs themselves

## Shared Result Shape

The API helpers return a discriminated result instead of throwing for normal backend rejections.

Real code:

```ts
export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<string, string>>;
};
```

That means callers can do:

- `if (!result.ok) { ... }`
- `result.data` only on success

This is already used by auth/settings code such as:

- `frontend/context/AuthContext.tsx`
- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(app)/settings/page.tsx`

## Evaluation Console Hygiene

Expected backend failures should be handled in UI state or toasts instead of being printed with `console.error`.

Protected pages should:

- skip API calls when there is no token
- show an in-app error message or toast when a request fails
- avoid logging expected `400`, `401`, `403`, or `404` responses to Chrome DevTools

Real code uses guards like:

```tsx
if (!token) {
  return;
}
```

and then handles failed API results without console logging:

```tsx
if (!result.ok) {
  notifyError(result.message);
  return;
}
```

This keeps the browser console clean during evaluation while still giving the user feedback. Server-side `console.error` can remain for unexpected backend failures because those logs are for Docker/server debugging, not Chrome DevTools.

## Auth Header Centralization

During the refactor, the file was updated to centralize bearer-token handling.

Real code:

```ts
function withAuthHeaders(token?: string | null, headers?: HeadersInit) {
  const resolvedHeaders = new Headers(headers);
  const resolvedToken = token ?? getStoredToken();

  if (resolvedToken) {
    resolvedHeaders.set("Authorization", `Bearer ${resolvedToken}`);
  }

  return resolvedHeaders;
}
```

Why this matters:

- helpers can accept an explicit token when the caller already has one
- older call sites can still fall back to `localStorage`
- route changes now happen in one helper instead of in many pages

## Social Contract Helpers

Phase 5 added helpers for the refactored social backend contract.

Examples:

```ts
export async function getFeedPosts(scope: FeedScope = "all", token?: string | null) {
  const path = scope === "friends" ? "/posts/friends" : "/posts";
  return requestWithAuth<FeedPost[]>(path, { token });
}

export async function getUserByUsername(username: string, token?: string | null) {
  const encodedUsername = encodeURIComponent(username);
  return requestWithAuth<PublicUser>(`/users/by-username/${encodedUsername}`, { token });
}

export async function acceptFriend(requestId: number, token?: string | null) {
  return requestWithAuth<{ friend: FriendRequest }>(`/friends/${requestId}/accept`, {
    method: "PATCH",
    token,
  });
}
```

This matches the backend contract from:

- `GET /posts`
- `GET /posts/friends`
- `GET /users/by-username/:username`
- `PATCH /friends/:id/accept`

## Direct Message Helpers

The API layer now includes typed helpers for direct chat in:

- `frontend/lib/api.ts`

Real helpers:

```ts
export async function createDirectConversation(targetUserId: number, token?: string | null) {
  return requestJson<CreateDirectConversationResponse>("/conversations/direct", {
    method: "POST",
    token,
    body: { targetUserId },
  });
}

export async function getConversations(token?: string | null) {
  return requestWithAuth<ConversationListResponse>("/conversations", { token });
}

export async function sendConversationMessage(
  conversationId: number,
  content: string,
  token?: string | null,
) {
  return requestJson<SendMessageResponse>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    token,
    body: { content },
  });
}
```

Why this matters:

- pages no longer hardcode chat endpoint strings
- request/response shape is explicit through types (`ConversationItem`, `ConversationMessage`)
- auth handling stays consistent through `withAuthHeaders(...)`

## Structured Notification Types

The frontend API layer now also knows the structured notification shape.

Real code:

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
};
```

Why this matters:

- the frontend no longer depends on a fake `content` sentence from the backend
- later UI can render text and links from `type`, `actor`, and `postId`
- this matches the backend refactor in `backend/src/controllers/notifController.js`

## Important Limitation Right Now

The shared helper layer is now aligned with the backend contract, but not every page has been migrated to use it yet.

So remember:

- `frontend/lib/api.ts` is now the target contract
- some feature pages and hooks still use direct `fetch(...)`
- later phases can migrate those call sites without changing the route logic again

## 2FA API Contract (Settings + Login)

The API layer now centralizes both 2FA setup and 2FA login confirmation in:

- `frontend/lib/api.ts`

Settings helpers:

- `sendTwoFactorSetupCode(token)` -> `POST /settings/auth/2fa/setup`
- `confirmTwoFactorSetup(token, code)` -> `POST /settings/auth/2fa/confirm`
- `disableTwoFactor(token)` -> `POST /settings/auth/2fa/disable`

Login helpers:

- `loginUser(...)` can now return either:
  - `{ token }` when 2FA is not required
  - `{ twoFactorRequired: true, pendingToken, email }` when code confirmation is required
- after receiving `twoFactorRequired`, the UI opens the dialog and auto-sends the first code
- `verifyLoginTwoFactorCode(pendingToken, code)` -> `POST /login/2fa/verify`
- `resendLoginTwoFactorCode(pendingToken)` -> `POST /login/2fa/resend` (used for first send and resend)

Why this matters:

- login page and settings page use one typed contract for 2FA states
- route strings and payloads stay centralized in one file
- the app does not issue a real auth token until the 4-digit code is verified when 2FA is enabled

## Mental Model To Remember

Think of `frontend/lib/api.ts` as the frontend-side adapter for backend contracts:

- backend routes change once
- helper names and types change once
- pages/hooks can migrate gradually

That is easier to explain, test, and refactor than editing every page route string by hand.
