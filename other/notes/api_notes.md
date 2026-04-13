# API Notes

## 1. Separate Friend Requests From Friendships

Current issue:
- `PUT /friends/:id` accepts a pending request.
- `DELETE /friends/:id` deletes a relationship row.
- That makes `:id` ambiguous because it refers to a friendship table row, not clearly to a user or a request resource.

Cleaner direction:
- Use one route family for pending requests.
- Use another route family for accepted friendships.

Example:
- `PATCH /friend-requests/:id/accept`
- `DELETE /friend-requests/:id`
- `DELETE /friends/:userId`

## 2. Keep Email Private In Public User Routes

Current issue:
- `GET /users` returns email for every user.
- `GET /users/:id` also returns email.
- In a social app, email is account data, not normal public profile data.

Cleaner direction:
- Return email only on private account routes like `GET /me`.
- Public user routes should expose only profile fields.

## 3. Mixed Naming Style

Decision:
- Ignored for this small student project.
- The API mixes action-style and resource-style routes, but this is not a priority issue right now.

## 4. Make Feed Scope Explicit

Current issue:
- `GET /posts` currently returns all posts.
- In a friend-based social app, it is clearer to separate the global feed from the friends feed.

Cleaner direction:
- Keep `GET /users/:id/posts` for one user profile.
- Keep `GET /posts` for a global or explore feed.
- Add `GET /posts/friends` for the home feed based on accepted friends.

## 5. Remove Duplicate Comment Route

Current issue:
- `POST /posts/:id/comments` is declared twice.
- One version uses upload middleware and the other does not.

Decision:
- Comments do not handle uploads.
- Keep only one comment creation route without upload middleware.

## 6. Add Pagination To List Routes

Current issue:
- List routes currently return full result sets.
- This becomes heavy when posts, notifications, or friends grow.

Why it matters:
- Pagination can power infinite scroll / load on scroll.
- Offset pagination is simpler for a student project.
- Cursor pagination is more stable for live feeds because new posts do not shift the list as easily.

Decision:
- Useful improvement, but can stay simple if implemented later with `page` and `pageSize`.

## 7. Keep Notification Creation Internal

Current issue:
- `POST /notifications` lets the client create notifications directly.
- Notifications are usually better created by backend logic when a real event happens.

Cleaner direction:
- Keep read/list/delete notification routes.
- Create notifications internally for actions like friend requests or other social events.

## What Should Actually Change Now

- Add a clear friends feed route such as `GET /posts/friends`.
- Keep `GET /users/:id/posts` for profile posts.
- Remove the duplicate `POST /posts/:id/comments` route.
- Keep only the non-upload version for comments.
- Stop returning email from public user routes like `GET /users` and `GET /users/:id`.
- Consider removing public `POST /notifications` and creating notifications only inside backend logic.
- Leave mixed naming style and advanced pagination as lower-priority improvements for now.
