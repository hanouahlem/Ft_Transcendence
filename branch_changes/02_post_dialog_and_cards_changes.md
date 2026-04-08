# Post Dialog And Cards Changes

- Stopped assigning post card variants by feed order.
- Post cards now pick one of the 5 visual variants from `post.id`, so the same post keeps the same look across feed and profile.
- Kept `PostDialog` separate from `PostCard`.
- Moved the discussion area to the right side on large screens.
- Added a nested discussion scroll area so comments can scroll independently.
- Kept the comment composer outside the scroll area so it stays visible.
- Stopped the left post panel from stretching to match the discussion panel height.
- Centered the post vertically in the large-screen dialog layout.
- Limited the discussion section height to `90vh`.
- Adjusted the custom scroll area so the scrollbar only appears when needed and does not reserve fake right padding.
- Fixed long unbroken comment text so it wraps instead of forcing the card or discussion column wider.
- Tightened comment card width behavior and author text shrinking.

Main files:

- `frontend/components/posts/PostCard.tsx`
- `frontend/app/(app)/feed/page.tsx`
- `frontend/components/profile/ProfileView.tsx`
- `frontend/components/posts/PostDialog.tsx`
- `frontend/components/ui/scroll-area.tsx`
- `frontend/components/posts/CommentCard.tsx`

