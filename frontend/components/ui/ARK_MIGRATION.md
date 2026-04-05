# Ark Migration Tracker

Goal: remove `radix-ui` dependencies from the local UI wrapper layer while keeping `@/components/ui/*` as the stable API used by the app.

Current migration note: `dialog.tsx` is now Ark-backed and intentionally kept thin. Feed dialog behavior issues should be fixed in the consuming component/page state, not by re-adding custom lifecycle or focus hacks to the shared wrapper.

This tracker is about implementation backing, not visual design. Archive styling should live in our own classes and tokens regardless of whether a wrapper is backed by Ark UI or native markup.

## Status Meanings

- `audit`: inventory confirmed, no migration work started
- `target-decided`: target backing chosen (`ark`, `native`, or `delete`)
- `rewriting`: wrapper is being migrated
- `migrated`: wrapper no longer depends on `radix-ui`
- `imports-cleaned`: app imports updated if needed and verified
- `radix-free`: no remaining Radix dependency for this wrapper or its direct helpers

## Command Checks

Remaining Radix-backed wrappers:

```bash
rg -n 'from "radix-ui"' frontend/components/ui frontend/components
```

Current wrapper usage:

```bash
rg -n '@/components/ui/(avatar|badge|button|dialog|label|separator|switch|tabs)\b' frontend/app frontend/components
```

## Inventory

| Component | File | Current Backing | Current Usage | Target | Priority | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Avatar | `frontend/components/ui/avatar.tsx` | `radix-ui` Avatar | feed, profile, friends, settings, home | `ark` | High | `audit` | Live on feed; likely needed by future archive pages |
| Badge | `frontend/components/ui/badge.tsx` | `radix-ui` Slot | old profile, old notifications | `ark` | Low | `audit` | Not used by final login/feed pages |
| Button | `frontend/components/ui/button.tsx` | native React | feed shell, feed posts, old home, old profile/settings/notifications | `native` | Low | `radix-free` | Canonical project button now carries the archive style directly; old `ArchiveButton` wrapper was removed |
| Dialog | `frontend/components/ui/dialog.tsx` | `@ark-ui/react` Dialog | feed dialogs | `ark` | Highest | `radix-free` | Rewritten as a thin Ark wrapper with shared classes and a boolean `onOpenChange` adapter |
| Label | `frontend/components/ui/label.tsx` | `radix-ui` Label | only local demo/helper usage | `ark` | Low | `audit` | No final-page dependency right now |
| Separator | `frontend/components/ui/separator.tsx` | `radix-ui` Separator | old settings pages | `ark` | Low | `audit` | No final-page dependency right now |
| Switch | `frontend/components/ui/switch.tsx` | `radix-ui` Switch | old settings pages | `ark` | Medium | `audit` | Good behavior-heavy Ark candidate if settings survives redesign |
| Tabs | `frontend/components/ui/tabs.tsx` | `radix-ui` Tabs | old profile page | `ark` | Medium | `audit` | Good behavior-heavy Ark candidate if profile survives redesign |

## Migration Order

1. `dialog`
2. `avatar`
3. `switch`
4. `tabs`
5. `button`
6. `badge`
7. `label`
8. `separator`

## Exit Criteria

- each wrapper above is marked `radix-free`
- `rg -n 'from "radix-ui"' frontend/components/ui frontend/components` returns no matches
- `radix-ui` can be removed from `frontend/package.json`
