# 4. Authentication and Authorization

Goal: understand how login works and how protected routes know who the user is.

## Two Different Ideas

These two concepts are related but not identical:

- authentication = "who are you?"
- authorization = "are you allowed to do this?"

In this project:

- JWT is used for authentication
- route checks and ownership checks are used for authorization

## Login Flow

The login controller is in `backend/src/controllers/userController.js`.

The frontend sends:

```text
POST /login
```

with:

- email
- password

The backend then:

1. finds the user by email in the database
2. compares the plain password with the stored hashed password using `bcrypt.compare(...)`
3. if valid, creates a JWT with `jwt.sign(...)`
4. sends the token back to the frontend

## Why Passwords Are Hashed

Passwords are not stored in plain text.

During registration:

- backend hashes the password with `bcrypt.hash(password, 10)`
- only the hash is stored in the database

During login:

- backend compares the input password to the stored hash

This is safer because the original password is not kept in the DB.

## JWT

JWT stands for JSON Web Token.

In this project, the token contains user identity data such as:

- `id`
- `email`

The token is signed with `JWT_SECRET`.

That matters because:

- backend can verify the token was signed by itself
- clients cannot forge valid tokens without the secret

## Where `JWT_SECRET` Is Used

`JWT_SECRET` is read through `getEnv("JWT_SECRET")`.

It is used in:

- `jwt.sign(...)` when logging in
- `jwt.verify(...)` in `authMiddleware`

If `JWT_SECRET` is missing, auth cannot work correctly.

## Auth Middleware

Protected routes use `authMiddleware` from `backend/src/middleware/auth.js`.

Example:

```js
router.get("/user", authMiddleware, ctrl.getUser);
```

The middleware:

1. reads `Authorization` header
2. extracts the token after `Bearer `
3. verifies the token
4. stores decoded payload in `req.user`
5. calls `next()`

If verification fails:

- request ends with `401`

## `Authorization: Bearer <token>`

Protected requests must send a header like:

```http
Authorization: Bearer eyJ...
```

The `Bearer` part is just the standard scheme name.
The actual JWT is the second part.

That is why the middleware uses:

```js
req.headers.authorization?.split(" ")[1]
```

It splits:

- `"Bearer eyJ..."` into `["Bearer", "eyJ..."]`

and keeps the token part.

## `req.user`

After a token is verified, the middleware attaches the decoded payload to:

- `req.user`

That means later controllers can know who is making the request without asking the frontend again.

Examples:

- `getUser` uses `req.user.id`
- friend and post logic use `req.user.id` for ownership or identity

## Authorization Checks

Authentication only tells you who the user is.

Authorization is the extra check that decides if they are allowed to perform an action.

Examples in this codebase:

- only the receiver of a friend request can accept it
- only the author of a post can delete it

So even with a valid token, a user cannot necessarily do everything.

## Mental Model To Remember

Think of auth like this:

```text
login -> token issued
protected request -> token verified
req.user populated
controller uses req.user to decide what is allowed
```

## Self-Check Questions

- What is the difference between authentication and authorization?
- Why do we hash passwords instead of storing them directly?
- What does `authMiddleware` do before calling `next()`?
- Why do controllers use `req.user`?
