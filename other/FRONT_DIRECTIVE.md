# Frontend Directive

Purpose: this file defines the rules for rebuilding the remaining frontend pages so they converge toward one consistent archive-style design system instead of reintroducing the deprecated generic UI.

This is a project directive, not a subject requirement from `other/transcendance.md`. The 42 subject defines functional requirements. This file defines how we implement the frontend consistently.

## 1. Current Source Pages

The only pages that currently represent the intended final visual direction are:

- `frontend/app/feed/page.tsx`
- `frontend/components/auth/login/*`

Use these as the main reference implementations for:

- archive colors
- typography
- paper/stage layering
- tape/thread/photo treatments
- spacing rhythm
- component decomposition

Do not use these pages as reference for the new design:

- `frontend/app/page.tsx`
- old settings/profile/notifications/friends pages still using generic `Button`, `Card`, `Badge`, etc.
- `frontend/app/feed/page.backup.tsx`

Those pages are legacy UI and should be replaced, not copied.

## 2. Global Visual Direction

The final frontend theme is the archive cream/paper style already used by login and feed.

The visual baseline lives in:

- `frontend/app/globals.css`

Current archive tokens:

- `--color-field-stage`
- `--color-field-paper`
- `--color-field-paper-muted`
- `--color-field-ink`
- `--color-field-label`
- `--color-field-accent`
- `--color-field-accent-blue`
- `--color-field-accent-green`

Current reusable archive utility classes:

- `.archive-page`
- `.archive-paper`
- `.archive-tape`
- `.archive-thread`
- `.archive-lines`
- `.archive-input`
- `.archive-photo`

Rules:

- new pages must use the archive token system from `globals.css`
- do not introduce one-off hardcoded palettes if a global token can be used instead
- if a new recurring color or surface is needed, add it globally first
- do not keep generic shadcn visual styling as the default direction
- avoid flat white dashboards and generic SaaS styling

## 3. Typography Rules

Use the archive font variables already wired globally:

- `--font-field-display-source`
- `--font-field-mono-source`

Mapped theme fonts already available:

- `font-field-display`
- `font-field-mono`

Rules:

- display text, titles, and editorial content should use the archive display font
- metadata, labels, counters, timestamps, and system text should use the archive mono font
- do not fall back to generic UI typography for new archive pages unless there is a specific accessibility reason

## 4. Layout Rules

For new final pages, prefer the same structural logic already visible in login/feed:

- stage background first
- paper surfaces layered on top
- important UI grouped into clear columns or paper panels
- generous whitespace
- fixed or sticky rails only when they improve scanning

Reference components:

- `frontend/components/archive/ArchiveSidebar.tsx`
- `frontend/components/archive/ArchiveRightRail.tsx`
- `frontend/components/archive/NatureCanvas.tsx`
- `frontend/components/auth/login/LoginArchivePanel.tsx`
- `frontend/components/auth/login/LoginPaperCard.tsx`

Rules:

- if a page needs the archive shell, reuse archive-level components before creating page-specific copies
- if a pattern is likely to appear on more than one page, move it to `frontend/components/archive`
- if a pattern is tied to one domain only, keep it in a feature folder like `frontend/components/feed`

## 5. Component Reuse Rules

### `frontend/components/archive`

This folder is for reusable archive UI building blocks that are not tied to one business entity.

Current examples:

- `ArchiveButton.tsx`
- `ArchiveNavButton.tsx`
- `ArchiveSidebar.tsx`
- `ArchiveRightRail.tsx`
- `NatureCanvas.tsx`
- `archiveUtils.ts`

Use this folder for:

- shared page shells
- shared archive buttons
- shared rail/sidebar/nav pieces
- generic archive decorations
- archive utility helpers

Do not put feed-specific or page-specific business logic here.

### `frontend/components/feed`

This folder is for feed-only UI helpers.

Current examples:

- `FeedActionButton.tsx`
- `feedUtils.ts`
- `types.ts`

Reusable post UI now lives in `frontend/components/posts`, for example:

- `PostCard.tsx`
- `PostDialog.tsx`
- `CommentCard.tsx`
- `CommentComposer.tsx`
- `NewPostCard.tsx`
- `NewPostDialog.tsx`

Rules:

- if a component renders posts/comments/feed actions, it stays in `feed`
- if a component becomes reusable outside the feed, promote it to `archive` or `ui`

### `frontend/components/ui`

This folder is the app-facing primitive layer.

Important rule:

- pages and feature components should import primitives from `@/components/ui/*`
- pages should not import Ark UI or Radix directly

This keeps the implementation backing replaceable without rewriting every page.

## 6. Primitive Layer Rules

We are migrating away from `radix-ui`.

Tracker:

- `frontend/components/ui/ARK_MIGRATION.md`

Current rule:

- if a primitive wrapper is still needed, migrate it to Ark or rebuild it locally
- do not add new Radix usage
- do not import from `radix-ui` in new page work

Preferred primitive strategy:

- behavior-heavy primitives can use Ark under `components/ui`
- simple archive primitives can be plain local React components

Examples:

- `dialog`: Ark-backed
- `avatar`: candidate for Ark migration
- `tabs`: candidate for Ark migration
- `switch`: candidate for Ark migration
- `button`, `badge`, `label`, `separator`: may be simpler as local archive primitives

## 7. Styling Rules For Future Pages

When rebuilding a page:

1. start from archive stage + paper surfaces
2. reuse tokens and archive utilities already in `globals.css`
3. extract repeated archive patterns into components
4. keep business state in the page or feature container
5. keep decorative logic separate from data logic

Do:

- create reusable archive components when reuse is realistic
- keep data ownership centralized in the route file or feature container
- use descriptive component names tied to the domain
- use `font-field-mono` for metadata and system labels
- use paper/stage contrast instead of generic bordered cards

Do not:

- reintroduce generic green/white landing-page styling from old pages
- add page-local color systems that duplicate global tokens
- import old generic components just because they already exist
- over-componentize one-off fragments
- mix archive and legacy design languages on the same page

## 8. Recommended Refactor Process For Each Page

When refactoring an old page:

1. identify whether the page needs archive shell components
2. identify which old `components/ui` pieces are still temporary/legacy
3. rebuild layout using archive tokens and surfaces
4. extract reusable archive pieces if they are not page-specific
5. keep business logic in the page first
6. only then split feature-specific rendering components
7. update `other/lessons/` if the new page introduces important architecture worth explaining during evaluation

## 9. Page Acceptance Checklist

A page is considered aligned only if:

- it visually matches the archive direction used by login/feed
- it reuses existing archive primitives where appropriate
- it does not introduce new Radix dependencies
- it does not depend on deprecated generic design components unless they are temporary and explicitly marked
- its recurring styles are tokenized or shared
- its data flow is explainable during evaluation

## 10. Practical Rule Of Thumb

Before creating or using a component, ask:

- is this primitive-level and reusable across the app
  - put it in `components/ui`
- is this archive-specific and reusable across several final pages
  - put it in `components/archive`
- is this tied to one domain like feed/profile/settings
  - keep it in that feature folder

If a component does not clearly fit one of those categories, stop and decide before adding another ad hoc pattern.
