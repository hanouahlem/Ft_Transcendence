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
- delete image files when a post is deleted

## Why A Service Layer Exists For Posts

Compared with user/friend logic, the posts feature is a bit heavier.

The service layer helps separate:

- HTTP-specific code
- business/data manipulation code

That makes controllers smaller and easier to read.

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
