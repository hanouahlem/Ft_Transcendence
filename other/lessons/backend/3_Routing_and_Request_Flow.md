# 3. Routing and Request Flow

Goal: understand how requests are organized and how a request reaches the right controller.

## Big Picture

In this project, the backend flow is:

```text
HTTP request
-> Express app in server.js
-> mounted router in routes.js
-> optional middleware
-> controller handler
-> HTTP response
```

Lesson 2 explained the app-level basics.
This lesson explains how the routes are organized in practice.

## App Routes vs Router Routes

### App route

Defined directly on the Express app, for example in `backend/src/server.js`:

```js
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
```

Use this for:

- top-level infrastructure endpoints
- simple server-level behavior

### Router route

Defined on an Express router in `backend/src/routes/routes.js`:

```js
router.post("/login", ctrl.loginUser);
router.get("/friends", authMiddleware, friend.getFriends);
```

Use this for:

- grouped application routes
- keeping `server.js` small
- organizing business endpoints in one place

## Why A Router Exists

This project imports a router in `backend/src/server.js` and mounts it with:

```js
app.use("/", route);
```

That means:

- `route` contains many application endpoints
- mounting it under `/` makes those paths available directly

So:

```js
router.post("/login", ctrl.loginUser);
```

becomes:

```text
POST /login
```

If the router had been mounted under `/api`, then the final path would have been `/api/login`.

## How Route Matching Works

Express looks at:

- the HTTP method
- the path

and then finds the first matching route.

Examples from this project:

- `POST /registerUser`
- `POST /login`
- `GET /user`
- `GET /friends`
- `GET /friends/suggestions`
- `GET /friends/requests`
- `GET /friends/requests/sent`
- `POST /posts`

These are all declared in `backend/src/routes/routes.js`.

## Public vs Protected Routes

Some routes are public:

- `POST /registerUser`
- `POST /login`
- `GET /users`

Some routes are protected by `authMiddleware`:

- `GET /user`
- `GET /users/search`
- all friends routes
- all posts routes

Protected route example:

```js
router.get("/user", authMiddleware, ctrl.getUser);
```

Meaning:

1. request reaches this route
2. `authMiddleware` runs first
3. if token is valid, controller runs
4. if token is invalid, request stops with `401`

## Middleware In Route Chains

Routes can have more than one step before the final controller.

Example:

```js
router.post("/posts", authMiddleware, upload.single("media"), createPostHandler);
```

This means:

1. check JWT with `authMiddleware`
2. parse uploaded file with Multer
3. if both succeed, run `createPostHandler`

So a route can be a small pipeline, not just one function.

## Controllers

A controller is the function that contains the route’s business logic.

Examples:

- `ctrl.loginUser`
- `friend.addFriend`
- `createPostHandler`

The router decides **which** controller runs.
The controller decides **what** the backend should do.

## Route Parameters

Some routes contain dynamic parts in the path.

Example:

```js
router.put("/friends/:id", authMiddleware, friend.acceptFriend);
```

The `:id` part means:

- Express extracts that part of the URL
- the controller can read it through `req.params.id`

Same idea for:

- `DELETE /posts/:id`
- `POST /posts/:id/like`
- `DELETE /posts/:id/like`

## Request Data Sources

When a controller runs, it can read data from different places:

- `req.params` -> values from the path like `:id`
- `req.query` -> values from the query string
- `req.body` -> JSON body or form body
- `req.headers` -> request headers
- `req.user` -> user info attached by auth middleware
- `req.file` -> uploaded file attached by Multer

This is why middleware matters so much:

- middleware prepares request data for later handlers

## Mental Model To Remember

The router is the traffic map of the backend.

It answers:

- which requests exist
- which middleware runs first
- which controller handles the request

## Self-Check Questions

- Why do we use `router.get(...)` / `router.post(...)` in `routes.js` instead of putting every endpoint in `server.js`?
- What does `app.use("/", route)` do?
- What happens first in `router.post("/posts", authMiddleware, upload.single("media"), createPostHandler)`?
- Where would a controller read `:id` from?
