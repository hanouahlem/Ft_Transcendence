# Feed Archive Components

Goal: be able to explain the archive-style feed page during evaluation without guessing.

This lesson is about the current frontend implementation only. It does not claim that the archive UI is a project requirement from `other/transcendance.md`. It explains how our feed page is built, how data moves through it, and why each component exists.

## 1. Big Picture

The feed route is split into:

- one page file that owns data fetching and mutations
- archive-level reusable layout components
- feed-specific components for posts, composer, and modal

Current files:

- `frontend/app/feed/page.tsx`
- `frontend/components/archive/ArchiveButton.tsx`
- `frontend/components/archive/ArchiveNavButton.tsx`
- `frontend/components/archive/ArchiveSidebar.tsx`
- `frontend/components/archive/ArchiveRightRail.tsx`
- `frontend/components/archive/NatureCanvas.tsx`
- `frontend/components/archive/archiveUtils.ts`
- `frontend/components/feed/FeedActionButton.tsx`
- `frontend/components/feed/FeedComposerCard.tsx`
- `frontend/components/feed/FeedPostCard.tsx`
- `frontend/components/feed/NewPostModal.tsx`
- `frontend/components/feed/feedUtils.ts`
- `frontend/components/feed/types.ts`

The important rule is:

- `page.tsx` owns state and backend calls
- components receive props and render UI

Real code:

```tsx
<ArchiveSidebar
  user={user}
  onCreatePost={() => setCreateOpen(true)}
  onLogout={logout}
/>

<FeedComposerCard
  user={user}
  content={postContent}
  previewUrl={previewUrl}
  selectedFileName={selectedFile?.name || ""}
  publishing={publishing}
  fileInputRef={fileInputRef}
  onPublish={handlePublish}
  onContentChange={setPostContent}
  onFileChange={handleFileChange}
  onOpenFilePicker={handleOpenFilePicker}
  onRemoveFile={handleRemoveFile}
/>
```

## 2. Route File: `frontend/app/feed/page.tsx`

This is the controller for the page.

It owns:

- authenticated user access through `useAuth()`
- all page state with `useState`
- derived values with `useMemo`
- data loading with `fetchPosts()` and `fetchExistingFriendRelations()`
- mutation handlers for publish, delete, like, favorite, comment, and friend request

Main state:

```tsx
const [posts, setPosts] = useState<FeedPost[]>([]);
const [postContent, setPostContent] = useState("");
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState("");
const [createOpen, setCreateOpen] = useState(false);
const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
```

Important derived data:

```tsx
const suggestions = useMemo(() => {
  const unique = posts.filter(
    (post, index, array) =>
      array.findIndex((item) => item.author.id === post.author.id) === index
  );

  return unique
    .filter((post) => post.author.id !== user?.id)
    .slice(0, 5)
    .map((post) => post.author);
}, [posts, user?.id]);
```

Explain this during evaluation:

- the right rail does not fetch its own data
- it reuses already-fetched post authors to build suggestions
- this keeps the number of requests lower and the page logic centralized

API base:

```tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
```

The page calls backend routes directly with `fetch`, for example:

- `GET /posts`
- `POST /posts`
- `DELETE /posts/:id`
- `POST` or `DELETE /posts/:id/like`
- `POST` or `DELETE /posts/:id/favorite`
- `POST /posts/:id/comments`
- `DELETE /comments/:id`
- `POST` or `DELETE /comments/:id/like`
- `POST` or `DELETE /comments/:id/favorite`
- `GET /friends`
- `POST /friends`

## 3. Shared Data Types

File:

- `frontend/components/feed/types.ts`

These types define the shape expected by the UI:

```ts
export type FeedAuthor = {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
};

export type FeedComment = {
  id: number;
  content: string;
  createdAt: string;
  author: FeedAuthor;
  likesCount: number;
  favoritesCount: number;
  likedByCurrentUser: boolean;
  favoritedByCurrentUser: boolean;
  media: string[];
};
```

Why this matters:

- the UI can stay typed even though data comes from the backend
- child components can declare exactly what they need
- when evaluators ask “what data does a post card receive?”, this file is the clearest answer

Also note in `frontend/lib/api.ts`:

```ts
export type CurrentUser = {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
};
```

We added `avatar` because the archive sidebar and modal display the current user image.

## 4. Archive-Level Components

These are reusable layout primitives, not feed-specific business components.

### `ArchiveButton.tsx`

Purpose:

- create one reusable button system for archive UI

How it works:

- uses `class-variance-authority` (`cva`)
- exposes variants: `ink`, `paper`, `stamp`, `subtle`
- exposes sizes: `sm`, `md`, `icon`

Real code:

```tsx
export const archiveButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl border ...",
  {
    variants: {
      variant: {
        ink: "border-field-ink bg-field-ink text-field-paper ...",
        paper: "border-field-label/25 bg-field-paper text-field-ink ...",
        stamp: "border-field-accent bg-transparent text-field-accent ...",
        subtle: "border-black/10 bg-black/5 text-field-label ...",
      },
```

Explain it like this:

- `ArchiveButton` is not a feed action
- it is a style system for normal buttons in the archive theme
- business meaning comes from the parent through props like `onClick` and `disabled`

### `ArchiveNavButton.tsx`

Purpose:

- render one sidebar navigation row

Props:

- `href`
- `label`
- `icon`
- `active`
- `expanded`
- `badge`

Important behavior:

- `expanded` only affects label visibility
- the sidebar owns hover state; the button just reacts to it

### `ArchiveSidebar.tsx`

Purpose:

- render the left archive navigation shell

Data it uses:

- `user: CurrentUser | null`
- `onCreatePost`
- `onLogout`
- current pathname from `usePathname()`

Local state:

```tsx
const [expanded, setExpanded] = useState(false);
```

Why local state here is fine:

- expanding/collapsing the sidebar is purely presentational
- no other component needs to know it

Important detail:

```tsx
const NAV_ITEMS = [
  { href: "/feed", label: "Timeline", icon: Home },
  { href: "/friends", label: "Discoveries", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell, badge: 3 },
```

Explain during evaluation:

- the sidebar owns navigation configuration in `NAV_ITEMS`
- `ArchiveNavButton` is the row renderer
- `ArchiveButton` is reused for “Log Entry” and “Logout”

### `ArchiveRightRail.tsx`

Purpose:

- render the search box, trends stack, observer suggestions, and small footer stats

Props:

- `totalPosts`
- `totalLikes`
- `totalComments`
- `suggestions`
- `sentRequests`
- `sendingFriendId`
- `onAddFriend`

Local state:

```tsx
const [query, setQuery] = useState("");
```

Derived data:

```tsx
const filteredSuggestions = useMemo(() => {
  const term = query.trim().toLowerCase();
  if (!term) {
    return suggestions;
  }
  return suggestions.filter((author) =>
    `${author.username} ${author.email}`.toLowerCase().includes(term)
  );
}, [query, suggestions]);
```

Key point:

- trends are static presentation data
- observer suggestions are real data coming from `page.tsx`
- “Follow” is a real action because it calls `onAddFriend(author.id)`

### `NatureCanvas.tsx`

Purpose:

- draw subtle animated particles behind the page

Why it is an archive component:

- it is page atmosphere, not feed business logic
- it could be reused on profile or other archive-style pages later

How it works:

- `useRef` stores the `<canvas>`
- `useEffect` initializes the drawing context
- helper functions create, update, and draw particles
- `requestAnimationFrame` runs the animation loop

This component does not receive data from the backend.

### `archiveUtils.ts`

Purpose:

- keep archive-level helpers out of feed-specific files

Current helper:

```ts
export function getInitials(value?: string | null) {
```

Used by:

- sidebar avatar fallback
- post avatar fallback
- modal avatar fallback

## 5. Feed-Specific Components

These components understand feed data like posts, comments, likes, and publishing.

### `FeedActionButton.tsx`

Purpose:

- render the small counters for comments, favorites, and likes

Props:

- `icon`
- `label`
- `count`
- `accent`
- `active`
- `disabled`
- `onClick`

Important behavior:

- if `onClick` is missing, it renders a non-interactive `<div>`
- if `onClick` exists, it renders a real `<button>`

Why:

- comment count is display-only
- like and favorite are interactive
- one component covers both cases

### `FeedComposerCard.tsx`

Purpose:

- render the inline post composer at the top of the feed

Data it uses:

- current content text
- preview URL
- selected file name
- publishing status
- a file input ref

Actions it receives:

- `onPublish`
- `onContentChange`
- `onFileChange`
- `onOpenFilePicker`
- `onRemoveFile`

Key detail:

- this component does not upload anything itself
- it only exposes user actions back to the page

That means the page still controls:

- when a file is selected
- when preview URLs are created/revoked
- when the actual `POST /posts` request happens

### `NewPostModal.tsx`

Purpose:

- render the modal version of the same publishing flow

Important difference from `FeedComposerCard`:

- the modal adds `open` and `onClose`
- it includes the current user avatar and header
- it returns `null` when `open` is false

Real code:

```tsx
if (!open) {
  return null;
}
```

Explain this clearly:

- the modal is controlled by the page
- it does not own the text/file state
- the same data can be reused between the inline composer and modal if we want to evolve the design later

### `FeedPostCard.tsx`

Purpose:

- render one post, its actions, its comments, and the reply box under it

This is the largest feed component because it contains:

- multiple visual card variants
- a nested `CommentNote` renderer
- the reply textarea
- like/favorite/delete actions for both posts and comments

Props:

- `post`
- `currentUserId`
- `variantIndex`
- `showConnector`
- all mutation callbacks
- all loading flags
- the current comment draft for this post

Why `variantIndex` exists:

- the component cycles through `POST_VARIANTS`
- this avoids every post looking identical
- the example design uses different card shapes, borders, rotations, and image framing

Real code:

```tsx
const variantKey = variantIndex % POST_VARIANTS.length;
const variant = POST_VARIANTS[variantKey];
```

Why `showConnector` exists:

- it decides whether to draw the dashed line between this post and the next one

Important evaluation point:

- `FeedPostCard` still does not own the real backend mutations
- it receives callbacks like `onToggleLike(post)` and `onAddComment(post.id)`
- the page remains the source of truth

### `feedUtils.ts`

Current helper:

```ts
export function formatFeedTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
```

Why this is separate:

- date formatting logic should not be duplicated inside post and comment rendering

## 6. Data Flow You Should Be Able To Explain

### Load posts

1. `page.tsx` gets `token` from `useAuth()`
2. `useEffect` calls `fetchPosts()`
3. `fetchPosts()` requests `GET /posts`
4. the result is stored in `posts`
5. `posts.map(...)` renders one `FeedPostCard` per post

### Publish a post

1. user types in `FeedComposerCard` or `NewPostModal`
2. component calls `onContentChange`
3. page updates `postContent`
4. user clicks publish
5. component calls `onPublish`
6. page builds a `FormData`
7. page sends `POST /posts`
8. page resets composer state and refetches posts

### Add a comment

1. user types in the reply textarea inside `FeedPostCard`
2. component calls `onCommentChange(post.id, value)`
3. page stores the text in `commentInputs[postId]`
4. user clicks comment
5. component calls `onAddComment(post.id)`
6. page posts to `POST /posts/:postId/comments`
7. page clears the specific comment input and refreshes posts

### Follow from right rail

1. page derives `suggestions` from existing feed authors
2. `ArchiveRightRail` filters them locally with `query`
3. clicking Follow calls `onAddFriend(author.id)`
4. page sends `POST /friends`
5. page updates `sentRequests`
6. rail disables the button or changes text to `Sent`

## 7. Styling System You Should Be Ready To Explain

The archive look is mostly shared through `frontend/app/globals.css`.

Main reusable classes:

- `.archive-page`
- `.archive-paper`
- `.archive-tape`
- `.archive-thread`
- `.archive-lines`
- `.archive-input`
- `.archive-photo`

Meaning:

- page background grid
- paper card shadow
- colored tape strips
- vertical stitched line
- notebook text lines
- shared input focus/placeholder style
- desaturated archive photo treatment

This is why components can stay mostly focused on structure and props instead of repeating custom CSS in every file.

## 8. Questions You Are Likely To Get

### Why is `page.tsx` still large?

Because it owns all backend communication and page state. We extracted rendering and interaction boundaries, but not the actual business logic.

### Why separate `archive` and `feed` folders?

Because some components are visual shell primitives that can be reused on other pages (`ArchiveSidebar`, `ArchiveButton`, `NatureCanvas`), while others are tied to feed entities like posts and comments (`FeedPostCard`, `FeedComposerCard`).

### Why does the right rail not fetch its own data?

Because the page already has the posts, and the right rail only needs a derived list of authors plus simple stats. Centralizing data flow keeps the architecture easier to explain and debug.

### Why do some components have local state?

Only for presentation concerns:

- sidebar expanded/collapsed
- right rail search query

Business data like posts, comments, publish state, and loading state stays in the page.

### Why use props instead of direct fetches inside child components?

Because children should stay reusable and predictable. If every component fetched and mutated on its own, data flow would be harder to follow during evaluation.

## 9. Fast Evaluation Summary

If you need a 30-second explanation:

> The feed page is controlled by `frontend/app/feed/page.tsx`. It fetches posts, stores all UI state, and owns every backend mutation. Archive components in `frontend/components/archive` provide the reusable shell and styling primitives. Feed components in `frontend/components/feed` render feed-specific UI like the composer, post cards, action buttons, and modal. Data always flows from the page into components through props, and user actions flow back up through callbacks.
