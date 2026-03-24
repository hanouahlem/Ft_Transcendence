# Login Page Example Documentation

## What Changed

The live login page at `frontend/app/login/page.tsx` now uses the newer notebook-style example from `other/examples/login_new.js`.

The old backup page at `frontend/app/login/page.backup.tsx` was left untouched on purpose.

## Why This Exists

The original example file was a large standalone React demo. For the real app, the goal was to keep the same visual identity while making the production page easier to read, explain, and maintain during evaluation.

## Page Structure

The page is still a single Next.js route, but it is split into small local components:

- `SvgDefinitions`: declares the SVG filters used by the paper and stamp effects
- `CanvasBackground`: draws the animated dust/thread layer behind the page
- `ArchivePanel`: renders the green repository panel on the right
- `PaperCard`: renders the paper card, form, footer, and social section
- `FieldInput`: keeps the framed input styling and focus states in one place
- `SocialProviderButton`: placeholder Google and GitHub buttons
- `StampSubmitButton`: the rotated login stamp that submits the form
- `MonoText` and `Bead`: small visual helpers used across the page

This keeps the main `LoginPage` component focused on auth state and form submission instead of presentation details.

## Real Authentication Flow

The redesign did not change the real login logic:

1. `LoginPage` stores `email`, `password`, `loading`, and `error` in local state.
2. On submit, it calls `loginUser({ email, password })` from `frontend/lib/api.ts`.
3. If the backend returns a token, it calls `await login(result.data.token)` from `frontend/context/AuthContext.tsx`.
4. Authenticated users are redirected to `/feed`.

The page still returns `null` while auth is loading or when the user is already logged in, which prevents flashing the login screen before redirect.

## Placeholder-Only Elements

These parts are visual for now and intentionally do not contain full backend logic yet:

- `Lost Key?`
- `Google`
- `GitHub`

They are kept in the layout because the example included them, but they should be wired later only if the project scope requires those flows.

## Responsive Behavior

- On large screens, the paper card overlaps the green archive panel like the example.
- On smaller screens, the layout stacks vertically so the form stays readable and usable.
- Decorative beads, tape strips, and stitched lines stay visual only and do not affect the auth logic.

## Fonts and Styling

The page injects the example fonts with a `useEffect` block:

- `Courier Prime` for labels and metadata
- `Noto Serif SC` for the big titles and stamp button

Tailwind handles most layout and spacing. Inline styles are only used where they are clearer than forcing complex arbitrary Tailwind utilities, such as:

- page and paper texture backgrounds
- the canvas drawing code
- SVG filter application on the stamp

## Where To Extend Later

If you need to continue this page later:

- Add real reset-password logic near the `Lost Key?` button inside `PaperCard`
- Add provider auth handlers to `SocialProviderButton`
- Keep API calls in `frontend/lib/api.ts`
- Keep auth session updates in `frontend/context/AuthContext.tsx`
- Keep this page focused on form UI and route-level behavior

## Verification Used For This Change

This frontend currently has no dedicated test runner configured in `frontend/package.json`, so verification for this redesign is based on:

- `npm run lint`
- `npm run build`

If the team later adds Vitest, Jest, or Playwright, this page can gain automated coverage for:

- redirect behavior
- error rendering
- loading state during submit
- placeholder button visibility
