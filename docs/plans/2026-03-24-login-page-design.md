# Login Page Redesign Design

**Date:** 2026-03-24

## Goal

Replace the live login page with the new notebook-style example from `other/examples/login_new.js` while keeping the current authentication behavior, redirect rules, and backup login page unchanged.

## Context

- The live page is `frontend/app/login/page.tsx`.
- The untouched fallback is `frontend/app/login/page.backup.tsx`.
- Auth still depends on `frontend/lib/api.ts` and `frontend/context/AuthContext.tsx`.
- The repo does not currently contain `lessons.md`, so the redesign will be documented in dedicated markdown files under `docs/`.

## Chosen Approach

Rebuild the example as a clean Next.js page using Tailwind-first styling and small local components inside the login page module.

This keeps the feature self-contained, preserves readability for evaluation, and avoids turning the page into a single large block copied from the raw example.

## UI Structure

The page will be split into a few focused pieces:

- `CanvasBackground` for the floating dust and thread animation
- `SvgDefinitions` for the paper and ink filters
- `PaperCard` for the main paper panel
- `ArchivePanel` for the green right-side visual block
- `FieldInput` for framed email and password fields
- `PlaceholderSocialButton` for Google and GitHub placeholder actions
- `StampSubmitButton` for the rotated login stamp button

## Behavior

- Keep the existing authenticated-user redirect to `/feed`
- Keep the current `loginUser` request and `login(token)` flow
- Keep backend error display on the form
- Keep social buttons visible as placeholders with no real auth wiring yet
- Keep the register link pointing to `/register`

## Responsiveness

- Desktop layout follows the full paper-card plus archive-panel composition from the example
- Mobile layout stacks the paper card and archive panel instead of preserving the overlapping desktop composition
- Decorative elements remain, but the form and submit action stay usable on small screens

## Verification

The frontend package does not expose a test runner, so verification will rely on:

- `npm run lint` in `frontend/`
- `npm run build` in `frontend/` if it runs successfully in this environment

## Documentation

Implementation notes for teammates will be written to `docs/login-page-example.md` after the page is finished.
