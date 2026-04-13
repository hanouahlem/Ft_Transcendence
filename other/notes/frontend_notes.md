# Frontend Route Notes

## Current Route Map

```
/                          Landing page (redirects to /feed if logged in)
/login                     Login
/register                  Register
/auth/42/handoff           42 OAuth callback
/auth/github/handoff       GitHub OAuth callback

(authenticated)
/feed                      Main feed
/friends                   Friends list and requests
/notifications             Notifications list
/profile                   Own profile
/profile/[username]        Another user's public profile
/settings                  Settings page (profile + password)
```

---

## 1. Profile Route Uses Username-Based URLs

Implemented:
- Active profile routes now use `/profile` and `/profile/[username]`.
- Public profile resolution goes through `GET /users/by-username/:username`.
- Internal profile links now point to username-based URLs instead of numeric ids.
- If a user changes their username, old links will break — acceptable for this project.

---

## 2. Remove Deprecated Settings Sub-Routes

Implemented:
- Deleted `/settings/security`, `/settings/notifications`, and `/settings/profile`.
- Kept `/settings` as the single account settings route.
- Updated active navigation so the sidebar points to `/settings` instead of the removed split pages.

---

## 3. Feed Supports Global And Friends Views

Implemented:
- `/feed` exposes `All` and `Friends` scopes.
- The page swaps between `GET /posts` and `GET /posts/friends`.
- Friends scope does not inject a freshly created post into the visible list unless it belongs in that filtered feed.

---

## 4. Notifications Are Not Actionable

Current issue:
- The old notifications page was built around `{ id, content, read, createdAt, userId }`.
- The backend now returns structured notification data, so that page no longer matches the API contract.
- Clicking a notification still does nothing except mark it read or dismiss it.

Decided approach:
- Add `type`, `actor`, and nullable `postId` to the notification response shape.
- The backend should include `actor.id`, `actor.username`, and `actor.avatar` so the frontend can build profile links without an extra lookup.
- Notifications that relate to your own post (like, comment) link to `/profile?post=[postId]`.
- The profile page reads the `?post=` query param on mount and auto-opens the existing post dialog for that post.
- Notifications that relate to another user's action (follow, unfollow, follow request accepted) link to `/profile/[actor.username]`.
- Mention notifications keep the actor-profile context for the referenced post: `/profile/[actor.username]?post=[postId]`.
- No dedicated `/posts/[id]` route needed.

Fallback:
- If the `?post=` linking is not done in time, just linking to `/profile/[actor.username]` is good enough for evaluation.
