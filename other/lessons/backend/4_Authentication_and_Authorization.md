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

- username or email
- password

The backend then:

1. finds the user by username or email in the database
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

## Minimum Password Length

The 42 subject requires email/password authentication with proper security. In this codebase, password security has two backend checks:

- passwords must contain between 8 and 20 characters
- passwords are hashed with bcrypt before being stored

The length rule lives in `backend/src/controllers/userController.js`:

```js
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 20;

function validatePasswordLength(password) {
  return (
    typeof password === "string" &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH
  );
}
```

It is checked when a local password is created or changed:

- `registerUser` for normal registration
- `updatePassword` for changing an existing local password
- `setPassword` for OAuth accounts that add a local password later

Why it matters:

- the backend is the security boundary, so a user cannot bypass the rule by editing frontend JavaScript
- the same rule is reused in every password creation path
- bcrypt still protects the stored value after the password passes validation

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

## 2FA Email Code Flow (4 Digits)

This project now uses a 4-digit email code for:

- enabling 2FA in settings
- confirming login when `twoFactorEnabled` is active

Main files:

- `backend/src/controllers/twoFactorController.js`
- `backend/src/controllers/userController.js`
- `backend/src/services/twoFactorService.js`
- `backend/src/routes/routes.js`

### Setup Flow In Settings

Protected routes (token required):

- `POST /settings/auth/2fa/setup`
- `POST /settings/auth/2fa/confirm`
- `POST /settings/auth/2fa/disable`

Real code path:

- `setupCodeTwoFa` sends code by email
- `checkTwoFaCode` validates a strict 4-digit code and enables `twoFactorEnabled`
- `disableTwoFA` clears 2FA state

Example validation from `twoFactorController.js`:

```js
const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";

if (!/^\d{4}$/.test(code)) {
  return res.status(400).json({ message: "Code must contain exactly 4 digits" });
}
```

### Login Flow With 2FA Enabled

Public routes:

- `POST /login`
- `POST /login/2fa/verify`
- `POST /login/2fa/resend`

How it works:

1. user submits login/password to `/login`
2. if password is valid and `twoFactorEnabled === true`, backend returns `twoFactorRequired: true` + a short-lived `pendingToken`
3. frontend opens the 2FA dialog and automatically sends the first code
4. frontend calls `/login/2fa/resend` (used for first send and resend)
5. frontend calls `/login/2fa/verify` with `pendingToken + code`
6. backend returns the normal app JWT only after code verification

Why this matters:

- password + email code are both required before issuing the session token
- 2FA verification stays server-side, not just a frontend check
- resend is controlled by backend (`/login/2fa/resend`)

Key terms evaluators may ask:

- pending token: a short-lived JWT for a temporary login challenge, not a full session
- step-up authentication: additional verification after password check
- verification TTL: code expiration window (`10 minutes` in `twoFactorService.js`)

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

## Related Next Step

If you want to understand how external providers such as GitHub or 42 would integrate with this same JWT flow, read:

- `lessons/backend/4b_OAuth_and_External_Authentication.md`
