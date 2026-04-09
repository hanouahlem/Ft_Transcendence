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

## Mental Model To Remember

Think of `frontend/lib/api.ts` as the frontend-side adapter for backend contracts:

- backend routes change once
- helper names and types change once
- pages/hooks can migrate gradually

That is easier to explain, test, and refactor than editing every page route string by hand.
