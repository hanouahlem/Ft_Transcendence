# 9. Public API Module

## What is this?

A **Major module** worth 2 points. It exposes a REST API that external clients can call without a user login session. Authentication is done via an API key header instead of JWT.

## Why it's needed

The 42 subject requires: "A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints."

## How it works

### Security: API Key

Every request to `/api/public/*` must include:
```
x-api-key: <value of API_KEY_PUBLIC env var>
```

The middleware in [backend/src/middleware/apiKey.js](../../../backend/src/middleware/apiKey.js) validates this header and returns `401` if it's missing or wrong.

### Rate Limiting

Implemented with `express-rate-limit` in [backend/src/middleware/rateLimit.js](../../../backend/src/middleware/rateLimit.js):
- 100 requests per 15-minute window per IP
- Returns `429 Too Many Requests` when exceeded

Both middlewares are applied at the router level in [backend/src/routes/publicApi.routes.js](../../../backend/src/routes/publicApi.routes.js), so every public endpoint is protected automatically.

### Endpoints (5 required)

All at `/api/public/posts`:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/public/posts` | List all posts |
| GET | `/api/public/posts/:id` | Get one post by ID |
| POST | `/api/public/posts` | Create a post (`content` + `authorId` in body) |
| PUT | `/api/public/posts/:id` | Update a post's content |
| DELETE | `/api/public/posts/:id` | Delete a post |

The controller [backend/src/controllers/publicApiController.js](../../../backend/src/controllers/publicApiController.js) queries Prisma directly and returns a simplified response (no `likedByCurrentUser` or `favoritedByCurrentUser` since there is no authenticated user context).

### Documentation (Swagger UI)

Available at: `http://localhost:3001/api-docs`

The spec is generated from JSDoc comments in the routes file using `swagger-jsdoc`. The config lives in [backend/src/swagger.js](../../../backend/src/swagger.js).

### Server wiring

In [backend/src/server.js](../../../backend/src/server.js):
```js
app.use("/api/public", publicApiRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

These are mounted **before** the main `"/"` router so they take priority.

## Key terms an evaluator might ask about

- **API Key** — a shared secret passed in a header (`x-api-key`). Unlike JWT it is not user-specific. Anyone who knows the key can call the API.
- **Rate limiting** — throttling repeated requests from the same IP to prevent abuse. `express-rate-limit` uses an in-memory counter per IP within a sliding window.
- **Swagger / OpenAPI 3.0** — a standard way to describe REST APIs. The spec is auto-generated from JSDoc `@swagger` comments and served as an interactive UI.

## Environment variable to set

```
API_KEY_PUBLIC=REPLACE_WITH_A_STRONG_PUBLIC_API_KEY
```

Add this to your `.env` file (see `.env.example`).

## Testing quickly with curl

```bash
# List posts
curl http://localhost:3001/api/public/posts \
  -H "x-api-key: your_key_here"

# Create a post
curl -X POST http://localhost:3001/api/public/posts \
  -H "x-api-key: your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello from the public API", "authorId": 1}'
```
