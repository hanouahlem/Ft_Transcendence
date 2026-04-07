# Friends Page Migration

## Overview
This updates the deprecated generic layout in `frontend/app/(app)/friends/page.tsx` to match the newly adopted "archive" style design system used by the Feed, Profile, and Login pages.

## Changes
- **Removed** all deprecated `lucide-react` UI components and old generic `Card` structures.
- **Removed** the overriding green gradient background that was hiding the global `AppSidebarShell` and `NatureCanvas` background context.
- **Implemented** the new `.archive-paper` component with `.archive-tape` detailing.
- **Connected** a real `searcheduser` function that retrieves users from the backend via the `API_URL` and dynamically filters observers based on search input.
- **Re-integrated** the `RightRail` layout component to hold the user's friend list with the `allowFollow={false}` configuration as expected in an up-to-date right rail for an already accepted friends list.
- **Added** interactive accept/decline functionality rendered directly within the new list view for incoming requests using the updated `Button` variants (`stamp`, `subtle`, `paper`, `bluesh`).
- **Replaced** inline error messages with the centralized `archiveToaster` API to keep page error boundaries clean.
- **Ensured** zero `radix-ui` dependencies were added, continuing compliance with `ARK_MIGRATION.md`.
