# 8. Reusable UI Components and Styling System

Goal: understand how the new archive-style feed is split into reusable components and why some design choices moved into global styles.

## What Changed

The feed page no longer renders everything in one file.

Instead, the route file:

- keeps the data fetching and action handlers
- passes state and callbacks into reusable feed components
- uses global archive classes from `Frontend/app/globals.css`

That split matters because the same visual language is intended to be reused later on profile and other app pages.

## Global Styling Tokens

The global file:

- `Frontend/app/globals.css`

now contains archive-style utility classes such as:

- `.archive-page`
- `.archive-paper`
- `.archive-tape`
- `.archive-thread`
- `.archive-lines`
- `.archive-input`
- `.archive-photo`

Real code:

```css
.archive-page {
  background-color: var(--color-field-stage);
  background-image:
    linear-gradient(rgba(26, 26, 26, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(26, 26, 26, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

.archive-paper {
  background: var(--color-field-paper);
  box-shadow: 8px 12px 30px rgba(26, 26, 26, 0.12);
}
```

Why this is useful:

- the feed does not need to redefine the paper/grid look on every component
- later pages can adopt the same design without copying CSS
- the login page and feed page now share the same palette and font tokens

## Feed Component Split

The route file is still:

- `Frontend/app/feed/page.tsx`

But the archive UI is now composed from:

- `Frontend/components/archive/ArchiveSidebar.tsx`
- `Frontend/components/posts/PostCard.tsx`
- `Frontend/components/posts/NewPostDialog.tsx`
- `Frontend/components/archive/ArchiveRightRail.tsx`
- `Frontend/components/feed/FeedActionButton.tsx`
- `Frontend/components/archive/ArchiveButton.tsx`

Example from the page:

```tsx
<ArchiveSidebar
  user={user}
  onCreatePost={() => setCreateOpen(true)}
  onLogout={logout}
/>

<ArchiveRightRail
  totalPosts={posts.length}
  totalLikes={totalLikes}
  totalComments={totalComments}
  suggestions={suggestions}
  sentRequests={sentRequests}
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

Post and comment timestamps now use Ark UI's relative-time utility through:

- `frontend/components/ui/relative-time.tsx`

Real code:

```tsx
<Format.RelativeTime value={date} numeric="auto" style="short" />
```

Why this matters:

- posts and comments now share one time-formatting component
- the UI shows relative time like "2 min ago" instead of fixed date strings
- the exact timestamp is still preserved in the `title` attribute for hover inspection

## One Small Type Fix That Matters

The backend current-user route already returns `avatar`, so the frontend type in:

- `Frontend/lib/api.ts`

was updated to include it:

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
3. what `ArchiveSidebar`, `PostCard`, `NewPostDialog`, and `ArchiveRightRail` each do
4. how real actions like publish, like, favorite, comment, and friend request still work after the redesign
