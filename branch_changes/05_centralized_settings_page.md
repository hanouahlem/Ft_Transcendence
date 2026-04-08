# Centralized Settings Page Changes

- Added the new real settings page at `frontend/app/(app)/settings/page.tsx`.
- Matched the archive paper layout from `other/examples/settings.js` while keeping the current app sidebar and right rail.
- Split the page into reusable settings components:
  - `frontend/components/settings/SettingsPaper.tsx`
  - `frontend/components/settings/SettingsField.tsx`
  - `frontend/components/settings/ProfilePhotoUploader.tsx`
  - `frontend/components/settings/BannerUploader.tsx`
  - `frontend/components/settings/SettingsPasswordSection.tsx`
- Added a `ledger` button variant for the example-style commit action.
- Added `hasPassword` to the safe current-user payload so the UI can switch between first-time password creation and normal password change.
- Added `PUT /settings/setpassword` for users whose DB password is `NULL`.
- Added `POST /settings/media` to reuse the existing Multer upload pipeline for avatar and banner images.
- Refactored upload middleware so posts keep `post-*` filenames and settings uploads use `user-*`.
- Added `refreshUser()` to `frontend/context/AuthContext.tsx` so the sidebar/user state updates immediately after settings changes.
- Updated sidebar/profile navigation so the primary settings entry now points to `/settings`.
- Updated lesson notes for auth context refresh behavior, centralized archive UI composition, password-state business logic, and user media uploads.
