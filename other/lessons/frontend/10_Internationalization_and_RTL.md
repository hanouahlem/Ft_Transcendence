# 10. Internationalization and RTL

Goal: explain how the frontend now supports multiple languages and true layout mirroring for RTL.

## Why We Added This

This module targets the project requirement for internationalization:

- multiple UI languages
- at least one RTL language
- full layout mirroring, not only text direction

In this repo, the first rollout covers:

- English (`en`)
- French (`fr`)
- Spanish (`es`)
- Arabic (`ar`, RTL)

## Where The i18n Core Lives

Main i18n files are grouped in one folder so teammates can present this module in one place:

- `frontend/i18n/config.ts`
- `frontend/i18n/messages.ts`
- `frontend/i18n/I18nProvider.tsx`
- `frontend/i18n/LocaleSwitcher.tsx`

Real config example from `frontend/i18n/config.ts`:

```ts
export const locales = ["en", "fr", "es", "ar"] as const;
export const rtlLocales = new Set<Locale>(["ar"]);

export function getLocaleDirection(locale: Locale) {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}
```

Evaluator keywords:

- locale
- direction (`ltr` / `rtl`)
- translation dictionary
- fallback locale

## Global App Wiring

Root layout now reads locale from cookie and applies both language and direction at the HTML level:

- `frontend/app/layout.tsx`

Real pattern:

```tsx
const cookieValue = cookieStore.get(localeCookieName)?.value;
const initialLocale = isLocale(cookieValue) ? cookieValue : defaultLocale;
const direction = getLocaleDirection(initialLocale);

<html lang={initialLocale} dir={direction}>
```

Then the app is wrapped with `I18nProvider`.

Why this matters:

- browser accessibility tools can read the right language
- direction-sensitive components render correctly from first paint

## Locale Persistence

`I18nProvider` keeps locale stable across reloads:

- localStorage key: `ft_locale`
- cookie key: `ft_locale`

File:

- `frontend/i18n/I18nProvider.tsx`

Real behavior:

- on load: read localStorage/cookie
- on change: update localStorage + cookie + `document.documentElement.lang` + `document.documentElement.dir`

## RTL Layout Mirroring Strategy

We did not only switch text direction. We replaced left/right assumptions with logical properties where needed.

Examples:

- Sidebar anchor from `left: 0` to `insetInlineStart: 0`
  - file: `frontend/components/layout/Sidebar.tsx`
- Right rail anchor from `right` to `insetInlineEnd`
  - file: `frontend/components/layout/RightRail.tsx`
- Input icon/button offsets from `left/right` to `insetInlineStart/insetInlineEnd`
  - files:
    - `frontend/components/layout/RightRailSearch.tsx`
    - `frontend/components/ui/FieldInput.tsx`
    - `frontend/components/settings/SettingsField.tsx`
- Badge position mirrored with `insetInlineEnd`
  - file: `frontend/components/layout/NavButton.tsx`

Why logical properties:

- one code path supports both LTR and RTL
- fewer duplicate classes and fewer RTL-only branches

## First Localized Surfaces

The initial rollout translates high-visibility and high-frequency UI first:

- auth pages (login/register)
- sidebar navigation
- right rail blocks
- messaging rail/thread/dialog
- password settings labels
- landing page headline and key cards

Representative files:

- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/register/page.tsx`
- `frontend/components/layout/Sidebar.tsx`
- `frontend/components/layout/RightRail.tsx`
- `frontend/components/messages/ConversationThread.tsx`

## Date/Number Locale Alignment

We also updated date/number formatting to use active locale:

- feed absolute time helper
  - `frontend/lib/feed-utils.ts`
- relative time component
  - `frontend/components/ui/relative-time.tsx`
- profile compact counts and joined date
  - `frontend/components/profile/ProfileView.tsx`

This avoids mixed-language UI (translated labels with fixed `en-US`/`fr-FR` dates).

## What To Say In Evaluation

Short explanation:

1. We centralized i18n in `frontend/i18n/` with typed locales and dictionaries.
2. We apply `lang` and `dir` globally from root layout and keep locale persistent.
3. Arabic triggers RTL and layout mirroring via logical CSS properties.
4. We translated core user journeys first and aligned date/number formatting with locale.

If asked "is it only text direction?":

- No. We mirrored fixed rails, badges, field icons, and spacing using inline logical properties.

## Evaluator Demo Checklist (2-3 min)

1. Open the locale switcher and move `en -> fr -> es -> ar`.
2. On each switch, show:
  - labels/text change immediately
  - date/time formatting follows locale
3. Switch to Arabic (`ar`) and verify full RTL behavior:
  - sidebar/right rail anchors mirror
  - search icons and field paddings mirror with logical properties
  - badges and absolute decorations follow inline-end/start, not fixed left/right
4. Open secondary screens (`/notifications`, `/settings`, `/message`) and confirm translated labels and statuses.
5. Explain fallback behavior:
  - if a key is missing in current locale, `I18nProvider` falls back to `en`
6. Show persistence:
  - change locale, refresh page, confirm locale and direction are preserved via cookie + localStorage.
