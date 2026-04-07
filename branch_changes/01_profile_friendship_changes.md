# Profile Friendship Changes

- Fixed the profile hero layout so metadata and actions behave more predictably.
- Put the location chip and the profile action buttons on the same row.
- Reworked the friendship CTA on other users' profiles:
  - `Add` when no relation exists
  - `Accept` when there is an incoming request
  - `Pending` when the current user already sent the request
  - `Remove` when the users are already friends
- Updated backend friend data so the frontend can remove an accepted friendship by id.

Main files:

- `frontend/components/profile/ProfileView.tsx`
- `frontend/hooks/useFriendRequests.ts`
- `backend/src/controllers/friendController.js`

