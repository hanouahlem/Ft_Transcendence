# User Profile Fields Changes

- Added optional `displayName` and `banner` fields to the `User` model.
- Added a Prisma migration for those columns.
- Exposed both fields in the user API read and update responses.
- Updated profile settings so users can edit:
  - display name
  - banner URL
  - avatar URL
  - existing profile fields
- Updated the profile hero to use `displayName` as the large visible name.
- Kept `@username` as the stable handle.
- Rendered a saved banner if one exists, otherwise fell back to the generated banner.
- Updated sidebar, posts, comments, and dialog author labels to prefer `displayName` while preserving `@username`.
- Updated right-rail suggestions to prefer `displayName` too, so generated fallback avatars stay consistent with the rest of the app.
- Preserved `displayName` in the feed page suggestion normalization so the feed right rail matches the profile right rail.
- Updated the team lesson notes to explain the backend and frontend behavior.
- Current note: the schema and migration file are ready, but the migration was not applied during the last pass because PostgreSQL was not reachable at `localhost:5432`.

Main files:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260407120000_add_profile_banner_and_display_name/migration.sql`
- `backend/src/controllers/userController.js`
- `backend/src/services/postService.js`
- `frontend/app/(app)/settings/profile/page.tsx`
- `frontend/components/profile/ProfileView.tsx`
- `frontend/components/profile/ProfileBanner.tsx`
- `frontend/components/layout/Sidebar.tsx`
- `frontend/components/posts/PostCard.tsx`
- `frontend/components/posts/PostDialog.tsx`
- `frontend/components/posts/CommentCard.tsx`
- `other/lessons/frontend/components.md`
- `other/lessons/backend/6_Business_Logic_by_Feature.md`
