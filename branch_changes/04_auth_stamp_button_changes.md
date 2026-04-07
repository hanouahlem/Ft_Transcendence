# Auth Stamp Button Changes

- Updated the shared `StampButton` component so its visual styling can be adjusted per usage without affecting every auth page.
- Added separate override props for:
  - text size via `textClassName`
  - padding via `paddingClassName`
  - border styling via `borderClassName`
- Kept `stampClassName` for broader wrapper-level overrides.
- This makes it possible to restyle the login page stamp button independently from the register page.

Main files:

- `frontend/components/ui/StampButton.tsx`
- `other/lessons/frontend/archive_design_system.md`
