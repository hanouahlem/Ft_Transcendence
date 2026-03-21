# Frontend Design Directive

This document defines the visual identity of the project. All frontend work must follow these rules. The style is derived from the reference files in `examples/react-app.js` and `examples/react-app-2.js`.

---

## Visual Identity

The design language is **brutalist editorial** — inspired by Swiss print design, newspaper mastheads, and raw modernist interfaces. It prioritizes sharp typography, hard edges, high contrast, and deliberate restraint. No rounded corners, no gradients, no shadows, no blur effects (except full-bleed background images).

### Key principles

- **Flat and sharp.** Zero border-radius everywhere. No `rounded-*` classes.
- **Borders as structure.** `1px solid black` borders define sections, inputs, and containers. Borders are layout tools, not decoration.
- **Typography is the design.** Large serif headings paired with tiny uppercase sans-serif labels create all the visual hierarchy needed. No icons as primary UI elements.
- **Three-color palette.** Orange, lime, black. One color at a time for emphasis. White space and typography do the heavy lifting.
- **Grayscale photography.** All images use `grayscale` + high contrast filters. No color photos.
- **No decorative UI.** No card shadows, no hover glows, no gradient backgrounds. Interactions are communicated through border weight changes and color swaps.

---

## Color Palette

All colors are defined as CSS variables in `globals.css`. Never hardcode hex values in components — always use Tailwind theme classes.

| Role | Light mode | Dark mode | Tailwind class |
|------|-----------|-----------|----------------|
| Background | `#E6E8E6` (warm gray) | `#1a1a1a` | `bg-background` |
| Foreground / text | `#000000` | `#E6E8E6` | `text-foreground` |
| Primary (orange) | `#FF4D00` | `#FF4D00` | `bg-primary`, `text-primary` |
| Secondary (lime) | `#CCFF00` | `#CCFF00` | `bg-secondary`, `text-secondary` |
| Muted | `#D8DAD8` | `#333333` | `bg-muted`, `text-muted-foreground` |
| Border | `#000000` | `#E6E8E6` | `border-border` |
| Destructive | `#FF0000` | `#FF3333` | `text-destructive` |

### Usage rules

- **Orange (`primary`)** is for primary actions, focus rings, active states, and accent surfaces (like the prompt area in react-app.js).
- **Lime (`secondary`)** is for highlights, tags, hover feedback, and the `FtHighlight` component. Used sparingly.
- **Black (`foreground`)** is for text, borders, and primary buttons. The dominant color.
- Background surfaces stay neutral (`bg-background`). Never use colored backgrounds for content sections unless it's a deliberate accent block (like the orange prompt area).
- Default mode is **light**. Dark mode inverts foreground/background but keeps orange and lime identical.

---

## Typography

Three font families, loaded in `layout.tsx`:

| Font | Variable | Tailwind class | Role |
|------|----------|---------------|------|
| Inter | `--font-sans` | `font-sans` | Body text, labels, buttons, UI chrome |
| Instrument Serif | `--font-serif` | `font-serif` | Headings, input values, quotes, display text |
| Geist Mono | `--font-mono` | `font-mono` | Code, technical values |

### Type scale and patterns

**Large display headings** (page titles, hero text):
- `font-serif text-4xl leading-none` (login/signup headings)
- From react-app.js: `font-family: Instrument Serif, fontSize: 2.2rem, lineHeight: 1` (promptText)
- From react-app-2.js: `fontSize: 4.5rem, lineHeight: 0.85, letterSpacing: -0.04em` (masthead)

**Section titles** (form sections, content headers):
- `font-serif text-2xl italic` with bottom border (react-app-2.js sectionTitle)

**Small labels** (form labels, section headers, metadata):
- `text-[0.65rem] uppercase font-semibold tracking-widest font-sans` (FtInputLabel)
- `text-[0.75rem] uppercase font-medium tracking-[0.02em]` (descriptions, separators)

**Input values**:
- `font-serif text-2xl` — inputs display in large serif (FtInput)

**Buttons**:
- `font-sans font-semibold text-[0.8rem] uppercase` (react-app.js footer buttons)

### Rules

- Headings are always `font-serif`. Body and labels are always `font-sans`.
- Small text (labels, metadata) is always `uppercase` with letter spacing.
- Never use font sizes between 0.8rem and 1.2rem for labels — either go small (`0.65rem–0.75rem`) or large (`1.5rem+`). The gap creates hierarchy.
- Tight or negative letter-spacing on large serif text. Open letter-spacing (`tracking-wide` to `tracking-widest`) on small uppercase text.

---

## Components

### FtInput (`components/ui/ft-input.tsx`)
Brutalist text input. Bottom border only, no background, serif font for values.
- Border: `border-0 border-b border-border`
- Focus: `focus:border-b-2 focus:border-primary` (thicker orange bottom border)
- Font: `font-serif text-2xl`
- Placeholder: `placeholder:text-muted-foreground/40`

### FtInputLabel (`components/ui/ft-input.tsx`)
Tiny uppercase label for form fields.
- `text-[0.65rem] uppercase font-semibold tracking-widest font-sans`

### FtHighlight (`components/ui/ft-highlight.tsx`)
Inline highlight tag with lime background and black border. Three variants:
- `default`: `px-1 font-semibold -rotate-1` — slight tilt, used inline
- `tag`: `px-2 py-0.5 text-[0.7rem] uppercase font-medium tracking-[0.02em]` — pill-shaped label
- `flat`: `px-1 font-semibold` — no rotation, inline emphasis

### FtShape (`components/ui/ft-shape.tsx`)
Decorative geometric shape from SVG library. Uses CSS mask to apply theme colors.
- `rotate` prop: `true` picks from `shapes-rotate/` and spins continuously. `false` picks from `shapes/` with a random fixed angle.
- `color` prop: `"orange"` | `"lime"` | `"black"`. Random if omitted.
- Size via `className`: `size-16`, `w-24 h-24`, etc.

### Buttons (shadcn `Button`)
- Default: `bg-primary text-primary-foreground` (orange, black text)
- Outline: `border-border bg-background` (black border, neutral background)
- All buttons have `rounded-lg` from shadcn but radius is `0rem` globally so they render square.

---

## Layout Patterns

### Auth pages (login, signup)
- Split layout: `grid min-h-svh lg:grid-cols-2`
- Left: form centered in column, max-width `xs` (~320px)
- Right: full-bleed grayscale image with `object-cover grayscale`
- Top-left: small logo/brand mark
- Form uses `FieldGroup` for consistent vertical spacing (`gap-5`)

### Section structure (from react-app.js)
- Sections are stacked vertically, separated by `1px solid black` borders
- Each section has a label bar: small uppercase text, `padding: 8px 16px`, bottom border
- Content areas have generous padding: `24px 16px`
- Accent sections (like the prompt area) use `bg-primary` with the same border structure

### Grid structure (from react-app-2.js)
- Two-column grid with narrow sidebar: `grid-template-columns: 0.4fr 1fr`
- Sidebar separated by `1px solid black` right border
- Vertical text labels using `writing-mode: vertical-rl`

---

## Images

- All images are grayscale: `grayscale` filter or `grayscale(100%) contrast(120%)`
- Photos stored in `public/images/`
- Use `next/image` with `fill` and `object-cover` for full-bleed containers
- Shape SVGs in `public/shapes/` (static) and `public/shapes-rotate/` (animated)
- Icon SVGs in `public/icons/`

---

## What NOT to do

- No `rounded-*` classes (all radii are 0)
- No `shadow-*` classes
- No gradients (`bg-gradient-*`)
- No blur effects on UI elements (`backdrop-blur`, `blur-*`)
- No hardcoded colors — always use theme variables (`bg-primary`, not `bg-orange-500`)
- No color photography — always `grayscale`
- No icon-heavy UI — typography and borders communicate hierarchy
- No hover animations with scale/opacity transitions — keep interactions sharp (color swap, border weight change)
- No card-based layouts with padding + shadow + rounded corners — use bordered sections instead



- Custom UI components: `FtInput`, `FtInputLabel`, `FtHighlight` — use these over raw shadcn inputs
- Fonts: Inter (sans), Instrument Serif (serif), Geist Mono (mono)
- Light mode by default
