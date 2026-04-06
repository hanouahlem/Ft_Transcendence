# Feed Archive Components

Goal: be able to explain the archive-style feed page during evaluation without guessing.

This lesson is about the current frontend implementation only. It does not claim that the archive UI is a project requirement from `other/transcendance.md`. It explains how our feed page is built, how data moves through it, and why each component exists.

## 1. Big Picture

The feed route is split into:

- one page file that owns data fetching and mutations
- archive-level reusable layout components
- shared UI primitives
- reusable post components plus data/helpers in `frontend/lib`

Current files:

- `frontend/app/feed/page.tsx`
- `frontend/components/layout/NavButton.tsx`
- `frontend/components/layout/Sidebar.tsx`
- `frontend/components/layout/RightRail.tsx`
- `frontend/components/layout/NatureCanvas.tsx`
- `frontend/components/posts/CommentCard.tsx`
- `frontend/components/posts/CommentComposer.tsx`
- `frontend/components/posts/NewPostCard.tsx`
- `frontend/components/posts/PostDialog.tsx`
- `frontend/components/posts/PostCard.tsx`
- `frontend/components/posts/NewPostDialog.tsx`
- `frontend/components/posts/SocialToggle.tsx`
- `frontend/components/ui/button.tsx`
- `frontend/components/ui/dialog.tsx`
- `frontend/components/ui/tooltip.tsx`
- `frontend/hooks/useArchiveToasts.ts`
- `frontend/hooks/useFriendRequests.ts`
- `frontend/hooks/usePostInteractions.ts`
- `frontend/lib/feed-types.ts`
- `frontend/lib/feed-utils.ts`
- `frontend/lib/user-utils.ts`

The important rule is:

- `page.tsx` owns page-specific fetching and composition
- `useArchiveToasts()` owns the archive success/error toast pattern
- `useFriendRequests()` owns the shared friend-request action state
- `usePostInteractions()` owns shared post/comment interaction state and mutations
- components receive props and render UI

Real code:

```tsx
<Sidebar
  user={user}
  onCreatePost={() => setCreateOpen(true)}
  onLogout={logout}
/>

<NewPostCard
  content={postContent}
  previewUrl={previewUrl}
  selectedFileName={selectedFile?.name || ""}
  publishing={publishing}
  onPublish={handlePublish}
  onContentChange={setPostContent}
  onOpenFilePicker={handleOpenFilePicker}
  onRemoveFile={handleRemoveFile}
/>
```

## 2. Route File: `frontend/app/feed/page.tsx`

This is the controller for the page.

It owns:

- authenticated user access through `useAuth()`
- composer state with `useState`
- derived values with `useMemo`
- data loading with `fetchPosts()` and `fetchExistingFriendRelations()`
- publish and friend-request mutations
- the shared post/comment mutation hook: `usePostInteractions()`

Real shared hooks:

```tsx
const { notifyError, notifySuccess } = useArchiveToasts();
const { sentRequests, sendingFriendId, handleAddFriend } = useFriendRequests({
  token,
});
const { posts, setPosts, handleToggleLike, handleAddComment, ... } =
  usePostInteractions({ token });
```

Main state:

```tsx
const [postContent, setPostContent] = useState("");
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState("");

const { posts, setPosts, handleToggleLike, handleAddComment, ... } =
  usePostInteractions({ token });
```

Important derived data:

```tsx
const suggestions = useMemo(() => {
  if (!user?.id) {
    return [];
  }

  return buildFeedSuggestions({
    allUsers,
    currentUserId: user.id,
    connectedUserIds,
    friendNetworks,
  });
}, [allUsers, connectedUserIds, friendNetworks, user?.id]);
```

Explain this during evaluation:

- the right rail does not fetch its own data
- the page fetches the network data and computes the recommendation list
- feed suggestions rank users by mutual-friend overlap first, then fill remaining slots with other users
- this keeps the page as the source of truth while `RightRail` stays presentational
- `useFriendRequests()` keeps the follow/request behavior consistent between feed and profile
- post/comment interaction logic is shared with the profile page through `usePostInteractions()`

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

- `frontend/lib/feed-types.ts`

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

## 4. Archive Shell And Shared UI Primitives

These are reusable layout or primitive components, not feed-specific business components.

### `frontend/components/ui/button.tsx`

Purpose:

- create one reusable button system for the whole archive-style frontend

How it works:

- uses `class-variance-authority` (`cva`)
- keeps the stable import path `@/components/ui/button`
- uses archive visual classes as the real button language
- exposes both standard app variants (`default`, `outline`, `secondary`, `destructive`) and archive-specific aliases (`paper`, `stamp`, `subtle`, `delete`, `black`, `bluesh`)
- exposes sizes like `sm`, `default`, `lg`, `icon`

Real code:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-none border ...",
  {
    variants: {
      variant: {
        default: "border-ink bg-ink text-paper ...",
        outline: "border-label/25 bg-paper text-ink ...",
        secondary: "border-black/10 bg-black/5 text-label ...",
        stamp: "border-accent-red bg-transparent text-accent-red ...",
      },
```

Explain it like this:

- `Button` is not a feed action
- it is the canonical button primitive for the project
- the archive style is now the default button language instead of a separate wrapper
- business meaning comes from the parent through props like `onClick` and `disabled`

## 5. Profile Archive View

The profile routes now reuse the same shell and post components as the feed instead of maintaining a second UI stack.

Current files:

- `frontend/app/(app)/profil/page.tsx`
- `frontend/app/(app)/profil/[id]/page.tsx`
- `frontend/components/profile/ProfileView.tsx`
- `frontend/components/layout/RightRail.tsx`
- `frontend/components/posts/PostCard.tsx`
- `frontend/components/posts/PostDialog.tsx`
- `frontend/hooks/useFriendRequests.ts`
- `frontend/hooks/usePostInteractions.ts`

How it works:

- both routes render the same client component: `ProfileView`
- `/profil` resolves the current authenticated user from `useAuth()`
- `/profil/[id]` parses the dynamic route parameter and passes it into `ProfileView`
- `ProfileView` fetches:
  - `GET /users/:id` for the profile metadata
- `GET /users/:id/posts` for the archive entries
- `GET /users/:id/friends` for the right-rail suggestions and the fellows count
- `ProfileView` reuses `useFriendRequests()` for follow/request state and mutations
- `ProfileView` reuses `usePostInteractions()` for delete, like, favorite, comment, and post-dialog state

Important design rule:

- the profile page does not recreate post cards, likes, favorites, or comments
- it reuses `PostCard` and `PostDialog`
- this keeps interaction logic consistent between feed and profile

Real route composition:

```tsx
<ProfileView profileId={profileId} />
```

Real post reuse:

```tsx
{posts.map((post, index) => (
  <PostCard
    key={post.id}
    post={post}
    currentUserId={user?.id}
    variantIndex={index}
    onOpenPost={handleOpenPost}
    onDelete={handleDelete}
    onToggleLike={handleToggleLike}
    onToggleFavorite={handleToggleFavorite}
  />
))}
```

Explain it during evaluation like this:

- the app shell is shared by the `(app)` layout through `AppSidebarShell`
- the profile page only owns profile-specific data loading and hero/stats layout
- the actual post interaction system is the same shared hook and components already used in the feed

### `frontend/components/layout/NavButton.tsx`

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

### `frontend/components/layout/Sidebar.tsx`

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
- `NavButton` is the row renderer
- `Button` from `frontend/components/ui/button.tsx` is reused for “Log Entry” and “Logout”

### Sidebar "Log Entry" -> `NewPostDialog` Flow

What this does:

- makes the post dialog available from any app page because the sidebar is app-wide

Why it's needed:

- the sidebar is rendered in `AppSidebarShell`, not inside `feed/page.tsx`
- owning dialog state in the same shell avoids route-coupled behavior

How it works:

```tsx
// frontend/components/layout/AppSidebarShell.tsx
const [createOpen, setCreateOpen] = useState(false);

<Sidebar onCreatePost={() => setCreateOpen(true)} ... />
<NewPostDialog open={createOpen} ... />
```

```tsx
// frontend/app/(app)/feed/page.tsx
useEffect(() => {
  const handlePostCreated = (event: Event) => {
    const createdPost = (event as CustomEvent<FeedPost | undefined>).detail;
    if (!createdPost) return;
    setPosts((prev) => [createdPost, ...prev.filter((p) => p.id !== createdPost.id)]);
  };

  window.addEventListener("archive:post-created", handlePostCreated);
  return () =>
    window.removeEventListener("archive:post-created", handlePostCreated);
}, []);
```

Key terms an evaluator may ask:

- app-level UI ownership: placing shared UI state in the layout shell
- controlled dialog: `NewPostDialog` opens/closes from `AppSidebarShell` state
- event sync: feed listens to `archive:post-created` so timeline updates instantly after dialog publish

### `frontend/components/layout/RightRail.tsx`

Purpose:

- render the search box, trends stack, observer suggestions, and small footer stats

Props:

- `totalPosts`
- `totalLikes`
- `totalComments`
- `sectionTitle`
- `suggestions`
- `sentRequests`
- `sendingFriendId`
- `onAddFriend`
- `allowFollow`

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
    author.username.toLowerCase().includes(term)
  );
}, [query, suggestions]);
```

Key point:

- trends are static presentation data
- observer suggestions are real data coming from `page.tsx`
- the component only needs `id`, `username`, and optional `avatar`, not full user records
- `sectionTitle` changes by route:
  - `You Might Know` on feed
  - `My Friends` on your own profile
  - `Alice's Friends` on another user profile
- “Follow” is a real action because it calls `onAddFriend(author.id)`

### `frontend/components/layout/NatureCanvas.tsx`

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

### `frontend/lib/user-utils.ts`

Purpose:

- keep generic user display helpers out of component folders

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

### `frontend/components/ui/dialog.tsx`

Purpose:

- wrap the Ark UI dialog primitive in one local reusable API

Why we use it:

- the repo already follows a shadcn-style pattern with local UI wrappers
- dialogs need focus trapping, escape handling, overlay behavior, and accessibility
- this is better than hand-writing modal behavior with plain `<div>` elements
- Ark is now the primitive layer for dialogs, while the app still imports our local wrapper

Important evaluation sentence:

- the app still imports `@/components/ui/dialog`
- only the hidden implementation backing changed from Radix to Ark

Real code:

```tsx
import { Dialog as ArkDialog, Portal } from "@ark-ui/react";

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ArkDialog.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <ArkDialog.Positioner className="fixed inset-0 ...">
        <ArkDialog.Content className={cn(...)} {...props}>
          {children}
        </ArkDialog.Content>
      </ArkDialog.Positioner>
    </DialogPortal>
  );
}
```

### `frontend/components/posts/SocialToggle.tsx`

Purpose:

- render the small social action chips for comments, favorites, and likes

Props:

- `icon`
- `label`
- `count`
- `accent`
- `pressed`
- `disabled`
- `onClick`

Important behavior:

- it uses Ark UI `Toggle.Root`
- it is controlled by the parent through `pressed`
- the parent still decides what the click means

Why:

- like and favorite are true toggled states
- comment count uses the same visual treatment so the action row stays consistent
- the component now lives with the post UI instead of a fake `feed` components folder

### `NewPostCard.tsx`

Purpose:

- render the inline post composer at the top of the feed

Data it uses:

- current content text
- preview URL
- selected file name
- publishing status

Actions it receives:

- `onPublish`
- `onContentChange`
- `onOpenFilePicker`
- `onRemoveFile`

Key detail:

- this component does not upload anything itself
- it only exposes user actions back to the page
- the hidden file input now lives once in `frontend/app/feed/page.tsx`

That means the page still controls:

- when a file is selected
- when preview URLs are created/revoked
- when the actual `POST /posts` request happens

### `NewPostDialog.tsx`

Purpose:

- render the dialog version of the same publishing flow

Important difference from `NewPostCard`:

- the dialog adds `open` and `onClose`
- it is rendered through the shared dialog wrapper
- it reuses the exact same `NewPostCard` UI instead of duplicating a second file input

Real code:

```tsx
<Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
  <DialogContent className="overflow-visible p-0">
```

Explain this clearly:

- the dialog is controlled by the page
- it does not own the text/file state
- the same data can be reused between the inline composer and dialog if we want to evolve the design later
- accessibility behavior now comes from Ark instead of custom modal markup

### `PostDialog.tsx`

Purpose:

- render the full post detail view in a dialog
- orchestrate the comment list and reply input

Why it exists:

- the feed timeline should stay compact
- comments should not be expanded under every post in the main feed
- clicking the post body opens this dialog
- clicking the comment button opens this dialog and focuses the reply input

Data it uses:

- `post: FeedPost | null`
- `currentUserId`
- `commentValue`
- all post/comment mutation callbacks
- all loading flags for post and comment actions

Important architecture point:

- `PostDialog` coordinates comment components
- `page.tsx` still owns comment state and backend requests

So the split is:

- `PostCard` = preview in the timeline
- `PostDialog` = detailed interaction surface for comments

### `CommentCard.tsx`

Purpose:

- render one archived comment inside the post dialog

Data it uses:

- `comment: FeedComment`
- `currentUserId`
- `index`
- comment-level mutation callbacks
- comment-level loading flags

What it renders:

- comment author and timestamp
- comment body
- optional comment media
- delete action for the comment owner
- like and favorite actions for the comment

Why it is separate:

- comment markup was making `PostDialog` too large
- a comment is now a clear UI unit with its own actions
- if we reuse this archive comment style later, extraction is already done

### `CommentComposer.tsx`

Purpose:

- render the reply textarea and submit button for a post dialog

Data it uses:

- `postId`
- `value`
- `submitting`
- `onChange(postId, value)`
- `onSubmit(postId)`

Important technical detail:

- it uses `forwardRef`
- this lets `PostDialog` keep programmatic focus control for the textarea

Why it is separate:

- the reply form has its own role and focus behavior
- extracting it keeps dialog orchestration readable
- state still stays in `page.tsx`, so we improved structure without moving business logic

### `PostCard.tsx`

Purpose:

- render one post preview inside the timeline

This component contains:

- multiple visual card variants
- clickable body/content area
- like/favorite/delete actions for the post
- a comment action that opens the post dialog

Props:

- `post`
- `currentUserId`
- `variantIndex`
- `onOpenPost`
- post-level mutation callbacks
- post-level loading flags

Why `variantIndex` exists:

- the component cycles through `POST_VARIANTS`
- this avoids every post looking identical
- the example design uses different card shapes, borders, rotations, and image framing

Real code:

```tsx
const variantKey = variantIndex % POST_VARIANTS.length;
const variant = POST_VARIANTS[variantKey];
```

Important evaluation point:

- `PostCard` still does not own the real backend mutations
- it receives callbacks like `onToggleLike(post)` and `onOpenPost(post.id)`
- the page remains the source of truth

### `frontend/lib/feed-utils.ts`

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
- it is not a component, so it belongs in `frontend/lib`

## 6. Data Flow You Should Be Able To Explain

### Load posts

1. `page.tsx` gets `token` from `useAuth()`
2. `useEffect` calls `fetchPosts()`
3. `fetchPosts()` requests `GET /posts`
4. the result is stored in `posts`
5. `posts.map(...)` renders one `PostCard` per post

### Publish a post

1. user types in `NewPostCard` or `NewPostDialog`
2. component calls `onContentChange`
3. page updates `postContent`
4. user clicks publish
5. component calls `onPublish`
6. page builds a `FormData`
7. page sends `POST /posts`
8. page prepends the new post into `posts`
9. page resets composer state

### Add a comment

1. user opens a post dialog from the post body or the comment button
2. user types in the reply textarea inside `PostDialog`
3. component calls `onCommentChange(post.id, value)`
4. page stores the text in `commentInputs[postId]`
5. user clicks comment
6. component calls `onAddComment(post.id)`
7. page posts to `POST /posts/:postId/comments`
8. page appends the returned comment inside the correct post
9. page clears the specific comment input

### Open a post

1. user clicks the post body or comment action in `PostCard`
2. `PostCard` calls `onOpenPost(post.id, focusCommentInput?)`
3. `page.tsx` stores that id in `activePostId`
4. if the comment action was used, `page.tsx` also sets a flag to focus the reply textarea
5. `activePost` is derived from `posts.find(...)`
6. `PostDialog` receives the selected post and opens

### Follow from right rail

1. page derives `suggestions` from existing feed authors
2. `RightRail` filters them locally with `query`
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

### Why separate `layout`, `ui`, `posts`, and `lib`?

Because shell components now live in `frontend/components/layout` (`Sidebar`, `RightRail`, `NatureCanvas`, `NavButton`), shared primitives live in `frontend/components/ui` (`button`, `dialog`, `tooltip`), post interaction UI lives in `frontend/components/posts` (`PostCard`, `PostDialog`, `CommentCard`, `CommentComposer`, `NewPostCard`, `NewPostDialog`, `SocialToggle`), and non-component helpers/types live in `frontend/lib` (`feed-types`, `feed-utils`, `user-utils`).

### Why does the right rail not fetch its own data?

Because the page already has the posts, and the right rail only needs a derived list of authors plus simple stats. Centralizing data flow keeps the architecture easier to explain and debug.

### Why do some components have local state?

Only for presentation concerns:

- sidebar expanded/collapsed
- right rail search query

Business data like posts, comments, publish state, and loading state stays in the page.

### Why use props instead of direct fetches inside child components?

Because children should stay reusable and predictable. If every component fetched and mutated on its own, data flow would be harder to follow during evaluation.

### Why use Ark for dialogs?

Because dialogs are accessibility-heavy primitives and Ark gives us focus handling, dismissal behavior, and keyboard support without forcing the app to import Ark directly. We keep our own wrapper in `frontend/components/ui/dialog.tsx`, so the app stays stable while the primitive layer changes underneath.

### Why do actions feel instant now instead of reloading the feed?

Because the page no longer refetches all posts after every successful mutation. After actions like like, favorite, publish, add comment, and delete post, `page.tsx` updates `posts` locally with `setPosts(...)`.

That means:

- the browser page is not reloaded
- the feed state changes in place
- the interface feels much more responsive

## 9. Fast Evaluation Summary

If you need a 30-second explanation:

> The feed page is controlled by `frontend/app/feed/page.tsx`. It fetches posts, stores all UI state, and owns every backend mutation. Shell components in `frontend/components/layout` provide the reusable page frame, shared primitives live in `frontend/components/ui`, post UI lives in `frontend/components/posts`, and non-component helpers/types live in `frontend/lib`. Data always flows from the page into components through props, and user actions flow back up through callbacks.
