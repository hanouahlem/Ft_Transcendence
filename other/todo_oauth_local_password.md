# OAuth Local Password Follow-Up

## Goal

Allow users created through OAuth (`GitHub` or `42`) to add a local password later, so one account can support:

- OAuth login
- email/username + password login

## Why this matters

Right now an OAuth-created account has:

- `password = null`
- a provider id such as `githubId` or `fortyTwoId`

That means the account works through OAuth only.

This is acceptable for now, but later the settings/security page should let an authenticated OAuth user create a first local password.

## Suggested behavior

- keep the public `/login` error generic
- in authenticated settings, detect `password = null`
- show a “Create password” flow instead of “Change password”
- require:
  - new password
  - confirm password
- hash the new password with `bcrypt`
- save it on the current user

After that, the same account should support both:

- provider login
- local password login

## Likely files to revisit

- `backend/src/controllers/userController.js`
- `frontend/app/settings/security/page.tsx`
- `frontend/lib/api.ts`

## Important note

This should be implemented only when the settings/security page is properly wired to the backend.
