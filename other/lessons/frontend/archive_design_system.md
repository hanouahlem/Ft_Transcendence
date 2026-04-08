# Archive Design System

Goal: define the archive-style frontend direction with enough structure to guide future page work, without pretending the system is fully finished.

This document describes the current implementation in the repo. It does not claim that the archive style is required by `other/transcendance.md`. It is our frontend design direction.

## 1. System Status

The archive design system already exists in a first usable form.

Real reference implementations:

- `frontend/app/feed/page.tsx`
- `frontend/components/auth/login/*`
- `frontend/components/auth/register/*`
- `frontend/app/globals.css`

This means:

- the repo already has real tokens, reusable classes, and reusable components
- the system is usable as a foundation for new pages
- some older pages still do not follow it consistently

Best way to explain it:

> We have a design-system foundation, but not a fully complete design system. The stable part is the archive visual language and its core primitives. The less stable part is how consistently every page applies it.

## 2. Stable Foundations

### Global Tokens

The main archive tokens live in `frontend/app/globals.css`.

Real code:

```css
--color-stage: #d4c9b3;
--color-paper: #f5f2eb;
--color-paper-muted: #e8e1d5;
--color-ink: #1a1a1a;
--color-label: #5a564c;
--color-accent-red: #d32f2f;
--color-accent-red: #d32f2f;
--color-accent-blue: #3a698a;
--color-accent-green: #285a35;
```

These are already stable enough to reuse across pages.

Meaning:

- `stage`: page background / table / wall / environment
- `paper`: main card or paper surface
- `paper-muted`: secondary paper surface
- `ink`: main readable text
- `label`: metadata and quieter labels
- accents: tape, buttons, highlights, active states

### Global Font Roles

Also defined globally:

```css
--font-archive-inter: var(--font-archive-inter-source);
--font-field-display: var(--font-field-display-source);
--font-field-mono: var(--font-field-mono-source);
```

Usage rule:

- `font-archive-inter` for neutral sans text inside the archive UI when the display or mono faces are too stylized
- `font-field-display` for editorial content, titles, strong readable UI text
- `font-field-mono` for metadata, timestamps, counters, labels, system language

This split is already visible in both login and feed.

## 3. Stable Shared Utilities

These utility classes already act like design-system primitives.

Defined in `frontend/app/globals.css`:

- `.archive-page`
- `.archive-paper`
- `.archive-tape`
- `.archive-thread`
- `.archive-lines`
- `.archive-input`
- `.archive-photo`

What they mean:

- `archive-page`: stage background and archive atmosphere
- `archive-paper`: main paper surface
- `archive-tape`: taped scrapbook detail
- `archive-thread`: stitched notebook/thread line
- `archive-lines`: lined-paper writing surface
- `archive-input`: consistent input/textarea focus behavior
- `archive-photo`: desaturated archival image treatment

These are good examples of a lightweight design system:

- pages do not need to rewrite the same visual logic
- we keep style decisions in shared CSS, not duplicated ad hoc in every component

## 4. Stable Components

### Shell Components

Folder:

- `frontend/components/layout`

Current stable pieces:

- `frontend/components/ui/button.tsx`
- `NavButton.tsx`
- `Sidebar.tsx`
- `RightRail.tsx`
- `NatureCanvas.tsx`

These are not business-specific. They are archive UI building blocks.

Real example from `frontend/components/ui/button.tsx`:

```tsx
variant: {
  default: "border-ink bg-ink text-paper ...",
  outline: "border-label/25 bg-paper text-ink ...",
  secondary: "border-black/10 bg-black/5 text-label ...",
  stamp: "border-accent-red bg-transparent text-accent-red ...",
}
```

This shows a real system rule:

- buttons should come from shared UI primitives, not be redefined page by page
- the design language lives in reusable components, not inside one screen

### Shared Decor And Typography

Folders:

- `frontend/components/decor`
- `frontend/components/typography`

Current stable pieces:

- `AccentBeads.tsx`
- `ArchiveTape.tsx`
- `ArchiveFilters.tsx`
- `WaxSeal.tsx`
- `MonoText.tsx`

Why this matters:

- decorative primitives can be reused across screens
- typography helpers and visual ornaments now have separate responsibilities
- small paper details like tape strips are reusable components instead of one-off markup

Additional reusable archive controls also live in `frontend/components/ui`:

- `FieldInput.tsx`
- `StampButton.tsx`

These matter because form primitives should be shared building blocks, not hidden inside one page component.

`StampButton` detail:

- `frontend/components/ui/StampButton.tsx` exposes separate styling hooks:
  - `textClassName`
  - `paddingClassName`
  - `borderClassName`
- that lets one auth screen change the stamp size, padding, or border weight without changing the other screen
- `stampClassName` still exists for broader wrapper overrides when needed
`FieldInput.tsx` is Ark Field-backed, so label, input, and error text stay grouped semantically while preserving the archive styling.

There is also an auth-scoped shared shell in:

- `frontend/components/auth/shared/AuthPageShell.tsx`
- `frontend/components/auth/shared/AuthPaperCard.tsx`
- `frontend/components/auth/shared/AuthGreenPanel.tsx`
- `frontend/components/auth/shared/AuthCardHeader.tsx`
- `frontend/components/auth/shared/AuthFormMeta.tsx`
- `frontend/components/auth/shared/AuthProvidersRow.tsx`

This keeps the page shell, paper card frame, green side panel, card header, form metadata block, and provider row reusable for login and register without pretending the full login form is generic.

### Post and Feed Components

Folders:

- `frontend/components/posts`
- `frontend/lib`

These are not global design-system primitives, but they are proof that the archive language can be applied consistently to a real feature.

Reusable post-domain UI lives in `frontend/components/posts`:

- `PostCard.tsx`
- `PostDialog.tsx`
- `CommentCard.tsx`
- `CommentComposer.tsx`
- `NewPostCard.tsx`
- `NewPostDialog.tsx`
- `SocialToggle.tsx`

Feed-specific helpers and types live in `frontend/lib`:

- `feed-utils.ts`
- `feed-types.ts`

This matters because a design system is only useful if real feature components can be built from it.

Real implementation detail:

- `frontend/components/posts/NewPostDialog.tsx` acts as a thin dialog wrapper
- `frontend/components/posts/NewPostCard.tsx` is the actual new-post UI

Why this split is useful:

- the composer visuals live in one place instead of being duplicated
- the feed can reuse the same post-creation card inline or inside a dialog
- this reduces styling drift and makes the code easier to explain during evaluation

### Login Components

Folder:

- `frontend/components/auth/login`

Important reference:

- `LoginPaperCard.tsx`

Why it matters:

- it already shows archive form styling
- it demonstrates how labels, inputs, metadata, stamps, and paper surfaces can work together
- layout values are defined close to the login layout where they are used
- decorative pieces used by login live in `frontend/components/decor`
- the archive micro-label text primitive lives in `frontend/components/typography/MonoText.tsx`
- the card composes reusable `FieldInput`, `StampButton`, and `ArchiveTape` primitives
- the page-level auth layout comes from `frontend/components/auth/shared/AuthPageShell.tsx`
- the outer paper frame comes from `frontend/components/auth/shared/AuthPaperCard.tsx`
- `AuthPaperCard.tsx` can vary its tape color for different auth screens
- the green side panel comes from `frontend/components/auth/shared/AuthGreenPanel.tsx` with alignment and tone variants
- the login card composes shared auth pieces for the header, document meta block, and OAuth provider row
- auth errors sit near the related field labels instead of as one generic block below the form
- login/register validate empty fields before the request, and backend auth responses can map field-level errors

Real example:

```tsx
<label
  className={cn(
    "bg-paper px-1 font-field-mono text-[11px] uppercase tracking-[0.12em] ...",
    focused ? "text-accent-red" : "text-label",
  )}
>
```

This is a real archive form pattern, not just a visual mockup.

### Register Components

Folder:

- `frontend/components/auth/register`

Important reference:

- `RegisterPaperCard.tsx`

Why it matters:

- it uses the same auth shell pieces as login
- it shows the shared auth layer works for more than one route
- it keeps registration behavior consistent while applying the archive presentation

## 5. What Is Still Provisional

These areas are not mature enough yet to be considered fully stable:

### Primitive Layer

Tracker:

- `frontend/components/ui/ARK_MIGRATION.md`

Meaning:

- the app-facing primitive layer exists
- its internal implementation is not fully uniform yet
- some wrappers are Ark-backed, others are Radix-backed

### Legacy Page Patterns

Not every page uses the archive system consistently yet.

So:

- the archive direction is stable
- page-level adoption is still uneven

### Spacing and Layout Scale

We have good real examples, but not a fully explicit spacing scale yet.

Current guidance:

- page-specific spacing is guided by login/feed references
- a complete spacing token system is not formalized yet

### Form Primitive Catalog

We have archive form styling in login and archive dialog styling in feed, but we do not yet have a full finalized archive set for:

- input
- textarea
- label
- checkbox/switch
- tabs

That is why the system is usable but not fully complete.

## 6. What We Should Formalize Now

This is the right level of formalization for the current stage:

### Formalize Now

- archive color tokens
- font roles
- core utility classes
- archive button variants
- archive page shell rules
- component placement rules: `ui` vs `archive` vs feature folders

### Do Not Over-Freeze Yet

- every possible spacing token
- every component variant
- every form pattern
- every layout type

Why:

- the direction is strong enough to guide work
- but the system still needs a few more rewritten pages before every pattern should be locked down

## 7. Recommended Next Steps

The next healthy evolution of the design system is:

1. keep using login and feed as reference implementations
2. continue migrating `components/ui` away from Radix
3. create archive-native primitives for the remaining shared pieces
4. rewrite more legacy pages using the same archive rules
5. only promote patterns to “official” reusable primitives after they appear more than once

That avoids two problems:

- under-defining the system and drifting back to inconsistent pages
- over-defining the system before enough real pages exist

## 8. Fast Evaluation Answer

If you need a short explanation:

> Yes, we already have the beginnings of a real archive design system. The stable part lives in `frontend/app/globals.css` with archive tokens and utility classes, in `frontend/components/layout` with reusable shell elements, and in `frontend/components/ui/button.tsx` with the shared archive-styled button primitive. The system is not fully mature yet because some old pages still use legacy generic UI and some primitive wrappers are still being migrated, but the direction is already explicit and reusable.
