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
/profil                    Own profile (rename to /profile pending)
/profil/[id]               Another user's profile (change to /profile/[username] pending)
/settings                  Settings page (profile + password)
```

---

## 1. Profile Route Should Use Username, Not ID

Current issue:
- `/profil/[id]` uses the numeric database ID and French spelling.

What to change:
- Rename the folder from `profil` to `profile` for consistent English naming.
- Change the dynamic segment from `[id]` to `[username]`.
- The backend needs to support user lookup by username (e.g. `GET /users/by-username/:username` or modify `GET /users/:identifier` to accept both).
- Update all internal links that point to `/profil` or `/profil/[id]`.
- If a user changes their username, old links will break — acceptable for this project.

---

## 2. Remove Deprecated Settings Sub-Routes

TODO:
- Delete `/settings/security`, `/settings/notifications`, and `/settings/profile` — all deprecated by the new unified `/settings` page.
- Remove the corresponding folders under `frontend/app/(app)/settings/`.

---

## 3. Feed Only Shows the Global Feed

Current issue:
- `/feed` calls `GET /posts`, which returns all posts.
- There is no friends-only feed view.

Cleaner direction:
- Once `GET /posts/friends` is added to the backend, add two tabs on the feed page ("All" and "Friends") that swap which endpoint is called.

---

## 4. Notifications Are Not Actionable

Current issue:
- The old notifications page was built around `{ id, content, read, createdAt, userId }`.
- The backend now returns structured notification data, so that page no longer matches the API contract.
- Clicking a notification still does nothing except mark it read or dismiss it.

Decided approach:
- Add `type`, `actor`, and nullable `postId` to the notification response shape.
- The backend should include `actor.id`, `actor.username`, and `actor.avatar` so the frontend can build profile links without an extra lookup.
- Notifications that relate to a post (like, comment) link to `/profile/[actor.username]?post=[postId]`.
- The profile page reads the `?post=` query param on mount and auto-opens the existing post dialog for that post.
- Notifications that relate to a user action (follow, unfollow, follow request accepted) link to `/profile/[actor.username]`.
- No dedicated `/posts/[id]` route needed.

Fallback:
- If the `?post=` linking is not done in time, just linking to `/profile/[actor.username]` is good enough for evaluation.
