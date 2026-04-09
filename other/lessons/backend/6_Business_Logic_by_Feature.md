# 6. Business Logic by Feature

Goal: understand what each controller or service is responsible for.

## Big Picture

The router maps requests to handlers, but the actual feature behavior lives in controllers and services.

In this project the main feature areas are:

- users and auth
- friends
- posts

## User And Auth Logic

File:

- `backend/src/controllers/userController.js`

Main responsibilities:

- register a user
- list users
- log in a user
- fetch the authenticated user
- update the authenticated user's profile fields
- search users by username

### `registerUser`

What it does:

- reads `username`, `email`, `password` from `req.body`
- validates required fields
- checks if username or email already exists
- hashes password with bcrypt
- creates user in DB
- returns safe user data

### `loginUser`

What it does:

- reads a login identifier and password
- finds user by username or email
- compares password with bcrypt
- signs JWT if valid
- returns token

### `getUser`

What it does:

- uses `req.user.id` from auth middleware
- fetches the current user from DB
- returns that user

### `updateUser`

What it does:

- only allows `PUT /users/:id` when the token user matches the route id
- checks username uniqueness before writing
- updates profile fields such as `username`, `displayName`, `banner`, `avatar`, `bio`, `location`, and `website`
- returns the updated safe profile payload

Real fields selected from `backend/src/controllers/userController.js`:

```js
const currentUserSelect = {
  id: true,
  username: true,
  displayName: true,
  email: true,
  banner: true,
  avatar: true,
  bio: true,
  status: true,
  location: true,
  website: true,
  createdAt: true,
};
```

Why it matters:

- the frontend profile settings page can fetch and save both a public display name and a banner URL
- profile reads and updates stay consistent because the same fields are exposed on `/user` and `/users/:id`

### `searchUser`

What it does:

- reads `username` from `req.query`
- searches users with Prisma `contains`
- returns matching users

## Friend Logic

File:

- `backend/src/controllers/friendController.js`

Main responsibilities:

- send friend request
- list accepted friends
- build mutual-friend suggestions for the right rail
- list incoming pending requests
- list outgoing pending requests
- accept a pending request
- delete a friend relation
- list pending friend requests

Important patterns in this file:

- uses `req.user.id` to know the acting user
- validates request ownership
- returns proper status codes for invalid actions

Examples:

- cannot add yourself
- cannot accept someone else’s request
- cannot accept a request already handled
- recommendation logic excludes the current user and already accepted friends, then fills empty slots with other users

Notification side effects now also live here:

- `addFriend` creates a `FOLLOW` notification for the receiver
- `acceptFriend` creates a `FOLLOW_ACCEPT` notification for the original sender
- both use the shared helper from `backend/src/services/notificationService.js`
- the helper skips self-notifications so the backend does not create noisy rows when actor and recipient are the same user

## Post Logic

Files:

- `backend/src/controllers/postController.js`
- `backend/src/services/postService.js`

This feature is split into:

- controller layer
- service layer

### Controllers

The post controllers handle HTTP concerns:

- read params/body
- validate request input
- check authenticated user
- send response codes/messages

### Service

`postService.js` handles more data/business work:

- format posts for frontend consumption
- create posts
- fetch posts with relations
- delete posts
- like/unlike posts
- return enough owner data for notification side effects after likes and comments
- delete image files when a post is deleted

## Why A Service Layer Exists For Posts

Compared with user/friend logic, the posts feature is a bit heavier.

The service layer helps separate:

- HTTP-specific code
- business/data manipulation code

That makes controllers smaller and easier to read.

### Post Notifications

Phase 3 of the refactor moved notification creation into real backend events instead of trusting `POST /notifications`.

Real code path:

- `backend/src/controllers/postController.js`
- `backend/src/services/postService.js`
- `backend/src/services/notificationService.js`

What happens now:

- `likePostHandler` calls `likePost(...)`
- the service returns whether a new like was actually created and which user owns the post
- the controller creates a `LIKE` notification only for a new like
- `createCommentHandler` calls `createComment(...)`
- the service returns both the formatted comment and the post owner id
- the controller creates a `COMMENT` notification for the post owner

Why this matters:

- the client can no longer forge a fake "X liked your post" event by calling the notifications route directly
- notifications stay tied to real database writes
- duplicate like notifications are avoided because liking an already-liked post returns `created: false`

## Validation And Error Handling Patterns

Across the backend, you can see repeated patterns:

- return `400` for bad input
- return `401` for missing/invalid auth
- return `403` for forbidden actions
- return `404` when the target resource does not exist
- return `500` for unexpected server errors

These patterns matter because they make the API predictable.

## Mental Model To Remember

Think of feature code like this:

- router chooses the feature handler
- middleware prepares request context
- controller validates the request and shapes the response
- service or Prisma performs the actual feature work

## Self-Check Questions

- Which file is responsible for login?
- Which file handles friend requests?
- Why do posts use a service layer in addition to a controller?
- What kind of logic belongs in a controller vs a service?

## Settings Additions

The centralized settings page added three important user/auth behaviors in:

- `backend/src/controllers/userController.js`

### Safe Current User Payload

`getUser` and `updateUser` return a safe boolean called `hasPassword` instead of exposing the password hash.

Real code:

```js
function toSafeCurrentUser(user) {
  const { password, ...safeUser } = user;

  return {
    ...safeUser,
    hasPassword: Boolean(password),
  };
}
```

Why this matters:

- the frontend can decide whether to show a first-time `set password` form or the normal 3-field `change password` form
- the backend still never leaks the real password value

### `setPassword`

What it does:

- handles `PUT /settings/setpassword`
- only works when the authenticated user currently has `password = NULL`
- hashes the new password with bcrypt before storing it

Why it matters:

- OAuth-created accounts can later add a local password
- this stays separate from the normal password-change flow

### `updatePassword`

What it does:

- handles `PUT /settings/security`
- requires `currentPassword`, `newPassword`, and `confirmPassword`
- verifies the current password before writing the new one
- rejects users who do not already have a local password

Why two handlers exist:

- first-time password creation and password rotation are different security checks
- keeping them separate makes the code easier to explain during evaluation
