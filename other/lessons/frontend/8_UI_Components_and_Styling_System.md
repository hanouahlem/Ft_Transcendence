# 8. Reusable UI Components and Styling System

Goal: understand how the archive-style feed is split into reusable components and why some design choices live in global styles.

## Component Split

The route file:

- keeps the data fetching and action handlers
- passes state and callbacks into reusable feed components
- uses global archive classes from `frontend/app/globals.css`

That split matters because the same visual language is intended to be reused later on profile and other app pages.

## Global Styling Tokens

The global file:

- `frontend/app/globals.css`

contains archive-style utility classes such as:

- `.archive-page`
- `.archive-paper`
- `.archive-tape`
- `.archive-thread`
- `.archive-lines`
- `.archive-input`
- `.archive-photo`

It also registers custom font families (for example the stamp font) so Tailwind utilities can use them from one place.

The app-only sans font is loaded separately in:

- `frontend/app/(app)/layout.tsx`

and uses `preload: false` because the archive app shell does not need the browser to preload an italic Inter face on first paint. This avoids noisy preload warnings while keeping `font-sans` available for the few UI elements that still use it.

Real code:

```css
@font-face {
  font-family: "font-stamp";
  src: url("/fonts/stamped/stamped.ttf") format("truetype");
  font-display: swap;
}

@theme inline {
  --font-stamp: "font-stamp";
}

.archive-page {
  background-color: var(--color-stage);
  background-image:
    linear-gradient(rgba(26, 26, 26, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(26, 26, 26, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

.archive-paper {
  background: var(--color-paper);
  box-shadow: 8px 12px 30px rgba(26, 26, 26, 0.12);
}
```

Why this is useful:

- the feed does not need to redefine the paper/grid look on every component
- later pages can adopt the same design without copying CSS
- app pages can share the same palette and font tokens

## Feed Component Split

The route file is:

- `frontend/app/feed/page.tsx`

The archive UI is composed from:

- `frontend/components/layout/Sidebar.tsx`
- `frontend/components/posts/PostCard.tsx`
- `frontend/components/posts/NewPostDialog.tsx`
- `frontend/components/layout/RightRail.tsx`
- `frontend/components/posts/SocialToggle.tsx`
- `frontend/components/ui/button.tsx`

Example from the page:

```tsx
<Sidebar
  user={user}
  onCreatePost={() => setCreateOpen(true)}
  onLogout={logout}
/>

<RightRail
  totalPosts={posts.length}
  totalLikes={totalLikes}
  totalComments={totalComments}
  sectionTitle={getRightRailTitle({})}
  suggestions={suggestions}
  sentRequests={rightRailSentRequests}
  sendingFriendId={sendingFriendId}
  onAddFriend={handleAddFriend}
/>
```

Why this split is important:

- `page.tsx` stays responsible for business logic
- components stay focused on presentation and user interaction boundaries
- evaluators can clearly see where state lives and where reusable UI lives

## Real Data Still Flows Through The New UI

The redesign is not mock-only.

For example, the page still fetches real posts and passes real handlers into the post card:

```tsx
<PostCard
  post={post}
  currentUserId={user?.id}
  onDelete={handleDelete}
  onDeleteComment={handleDeleteComment}
  onToggleLike={handleToggleLike}
  onToggleFavorite={handleToggleFavorite}
  onToggleCommentLike={handleToggleCommentLike}
  onToggleCommentFavorite={handleToggleCommentFavorite}
  onCommentChange={handleCommentChange}
  onAddComment={handleAddComment}
/>
```

So the rule to remember is:

- route file = real fetch and mutation logic
- feed components = reusable presentation blocks

## Relative Time Formatting

Post and comment timestamps use one shared relative-time component built on:

- `frontend/components/ui/relative-time.tsx`
- `frontend/components/ui/tooltip.tsx`

Real code:

```tsx
<Tooltip content={absoluteTime}>
  <time dateTime={date.toISOString()}>
    <Format.RelativeTime value={date} numeric="auto" style="short" />
  </time>
</Tooltip>
```

Why this matters:

- posts and comments share one time-formatting rule
- the UI can show relative time like "2 min ago" while still exposing the exact timestamp
- the tooltip keeps timestamp display consistent with the rest of the design system

## API Type Alignment

The frontend user type should match the backend current-user payload. For example, if the backend returns `avatar`, the frontend type must include it.

- `frontend/lib/api.ts`

Example:

```ts
export type CurrentUser = {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
};
```

This lets the sidebar, modal, and right rail show the authenticated user consistently.

## Key Terms

- design token: a shared color, font, radius, or style variable used across components
- presentation component: a component focused on rendering and interaction UI, not owning the main data flow
- route component: the page entry file that owns the page state and backend calls
- prop drilling: passing data and handlers from the page into child components on purpose

## What To Be Ready To Explain

Before evaluation, each teammate should be able to explain:

1. why archive styling moved into `Frontend/app/globals.css`
2. why `Frontend/app/feed/page.tsx` still owns the fetch/mutation logic
3. what `Sidebar`, `PostCard`, `NewPostDialog`, and `RightRail` each do
4. how real actions like publish, like, favorite, comment, and friend request still work after the redesign

## Settings Page Reuse

The same archive design system now powers the centralized settings page too.

New files:

- `frontend/app/(app)/settings/page.tsx`
- `frontend/components/settings/SettingsPaper.tsx`
- `frontend/components/settings/SettingsField.tsx`
- `frontend/components/settings/ProfilePhotoUploader.tsx`
- `frontend/components/settings/BannerUploader.tsx`
- `frontend/components/settings/SettingsPasswordSection.tsx`

What this shows:

- the route file still owns fetches, saves, uploads, and auth refresh
- the settings components own the archive paper layout and section-level presentation
- the page reuses shared app shell pieces like `RightRail` and `Button`
- the old split settings routes were removed, so this component set only serves `frontend/app/(app)/settings/page.tsx`

The `ledger` button variant lives in:

- `frontend/components/ui/button.tsx`

It is the stronger black-and-orange commit button used by the settings paper.

This matters during evaluation because it shows the archive style is a reusable system, not a one-page experiment.

## Ark PasswordInput Integration

Password fields now use Ark UI's dedicated password primitive instead of plain `<input type="password">` in the places users expect show/hide behavior:

- `frontend/components/ui/FieldInput.tsx` (used by login/register password fields)
- `frontend/components/settings/SettingsField.tsx` (used by settings password fields)

Real code pattern:

```tsx
<PasswordInput.Root>
  <PasswordInput.Input
    type="password"
    value={value}
    onChange={onChange}
  />
  <PasswordInput.VisibilityTrigger type="button">
    <PasswordInput.Indicator fallback="Show">Hide</PasswordInput.Indicator>
  </PasswordInput.VisibilityTrigger>
</PasswordInput.Root>
```

Why this is useful:

- one consistent show/hide interaction across login, register, and settings
- less custom password-toggle logic to maintain in page components
- keeps existing validation and submit flow unchanged, because the same controlled `value` and `onChange` are still used

Key term:

- controlled input: form input value is owned by React state (`value` + `onChange`), not unmanaged DOM state
