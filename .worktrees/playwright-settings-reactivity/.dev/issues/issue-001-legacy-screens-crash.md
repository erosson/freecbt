# Issue: Dead legacy screens crash Expo Go, blocking v2 settings UI

## Summary

The `(legacy)/` route group in `expo54/src/app/` contains 13 screen files that are unreachable via v2 navigation but still loaded by Expo Router at startup. One of these — `(legacy)/settings.tsx` — imports `expo-notifications`, which was removed from Expo Go in SDK 53. This causes a fatal crash that prevents `v2/(public)/settings/index.tsx` from rendering correctly, making `ThemeForm` (dark mode toggle) invisible to users despite being fully implemented.

## Root Cause

Expo Router eagerly loads all files under `src/app/` as routes. The `(legacy)/` group uses parentheses to hide the folder name from URLs, but the files are still registered and executed. When `(legacy)/settings.tsx` crashes on import, it corrupts the settings route resolution.

**Crash:**

```
ERROR expo-notifications: Android Push notifications removed from Expo Go with SDK 53.
Call Stack: (legacy)/settings.tsx:37
            (legacy)/intro.tsx:21  ← imports setNotifications from ./settings
```

## Impact

| Affected          | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `ThemeForm`       | Invisible — dark mode toggle inaccessible to users               |
| `SelectorButtons` | Appears to render with zero height due to route crash            |
| All of settings   | Partially broken — pincode/language visible, theme/reminders not |

## Why Legacy Screens Are Dead Code

All `(legacy)/` screens are registered only in `App.tsx`:

```ts
// TODO not used after expo-router migration, delete me
export function App() { ... }
```

`App.tsx`'s `App()` is explicitly marked dead. The default export `Root()` renders nothing. All live navigation goes through `v2/(public)/_layout.tsx` (Expo Router Drawer) which only references `v2/` screens.

## Fix

Remove all 13 files under `src/app/(legacy)/` — 2,494 lines of dead code:

```
src/app/(legacy)/_layout.tsx
src/app/(legacy)/backup.tsx
src/app/(legacy)/debug.tsx
src/app/(legacy)/export.tsx
src/app/(legacy)/help.tsx
src/app/(legacy)/index.tsx
src/app/(legacy)/intro.tsx
src/app/(legacy)/lock-update.tsx
src/app/(legacy)/settings.tsx
src/app/(legacy)/thoughts/[id]/edit.tsx
src/app/(legacy)/thoughts/[id]/index.tsx
src/app/(legacy)/thoughts/create.tsx
src/app/(legacy)/thoughts/index.tsx
```

## Verified

- Dark mode toggle (`ThemeForm`) now visible in settings after fix
- System default / Light / Dark theme switching confirmed working
- No broken imports — nothing in `v2/` or `src/` references `(legacy)/`
