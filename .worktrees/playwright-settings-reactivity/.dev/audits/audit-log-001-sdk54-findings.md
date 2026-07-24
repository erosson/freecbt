<div align="center">

# FreeCBT — Audit Findings

_log of things noticed during codebase exploration._
_Not a roadmap. No priority. No assignees._

Sources: code inspection · erosson's [Grist test plan](https://docs.getgrist.com/2Ziw1XgjdpWT/FreeCBT-test-plan)

</div>

## Fixed

| #     | Finding                                                                                               | Source                                |
| ----- | ----------------------------------------------------------------------------------------------------- | ------------------------------------- |
| F-001 | Dead `(legacy)/` screens crash Expo Go via `expo-notifications` (SDK 53 removal) · blocks `ThemeForm` | Code inspection                       |
| F-002 | Settings language dropdown hidden                                                                     | Grist issues row 4 · device confirmed |

> **F-001:** Fixed · `fix/remove-dead-legacy-screens` · 13 files / 2494 lines removed
> **F-002:** Same root cause as F-001 · resolved by same fix · dark mode toggle now visible

## Open

| #     | Finding                                                                                                | Source                                        |
| ----- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| F-003 | Save and finish button looks wrong                                                                     | Grist issues row 3                            |
| F-004 | Distortion screen — swipe counts as button press (iOS)                                                 | Grist issues row 5                            |
| F-005 | Language change doesn't propagate until switching screens                                              | Grist issues row 9                            |
| F-006 | Backup screen broken — save/load file not working                                                      | Grist test-cases row 25 · marked BROKEN       |
| F-007 | Data persistence across app upgrades — untested on v2.5.0                                              | Grist test-cases row 1 · "most critical test" |
| F-008 | v2.5.0 test plan — 63 executions blank since 2026-01-09                                                | Grist executions-raw rows 180–242             |
| F-009 | `expo-notifications` imported in `src/hooks/use-reminders.ts`                                          | Code inspection                               |
| F-010 | #603 — save and add another / go to index buttons missing                                              | GitHub issue · code inspection                |
| F-011 | Settings UI shows mixed languages — `*` prefixed strings may fall back to English regardless of locale | `en.json` design · confirmed on device (PT)   |

**F-006:** erosson notes: created backup, couldn't find the file on import

**F-007:** Needs preview build · must never lose user data

**F-008:** All platforms (android/ios/web) · zero test runs in 6 months

**F-009:** Not crashing yet · not in `app/` route · marked iOS-only with TODO

**F-010:** `Routes.thoughtCreateV2()` + `Routes.thoughtListV2()` exist · translation keys missing

**F-011:** Affects theme header, reminders header, settings header · intentional marker by erosson for untranslated strings · translation gap, not a code bug

## Notes

- **Dark mode** — fully wired in model + style + settings UI · visible after F-001 fix · not tested thoroughly
- **`App.tsx`** — marked `// TODO delete me` · safe to remove after further validation
- **`src/legacy/`** — still present · contains feature flags, theme, i18n used by now-deleted `(legacy)/` routes · needs audit
