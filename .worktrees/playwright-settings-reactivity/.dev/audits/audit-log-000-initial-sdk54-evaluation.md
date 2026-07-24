<div align="center">

# FreeCBT — SDK 54 Migration Audit

![Expo](https://img.shields.io/badge/expo-54.0.20-000020?style=flat&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/react_native-0.81-61DAFB?style=flat&logo=react&logoColor=black)
![Node](https://img.shields.io/badge/node-22.16.0-339933?style=flat&logo=nodedotjs&logoColor=white)
![Android](https://img.shields.io/badge/device-Pixel_9-3DDC84?style=flat&logo=android&logoColor=white)
![Status](https://img.shields.io/badge/status-complete-brightgreen?style=flat)

<table><tr>
<td><b>Branch</b></td><td><code>expo54-from-scratch</code> → <code>master</code></td>
<td><b>Started</b></td><td>2026-07-14</td>
</tr></table>

</div>

> Evaluate the state of the SDK 54 migration before committing to a contribution direction.

## Environment

<table>
<tr><td>Container</td><td><code>javascript-node:1-22-bullseye</code></td></tr>
<tr><td>Node</td><td>22.16.0</td></tr>
<tr><td>Android SDK</td><td><code>/usr/local/lib/android</code> (native Linux)</td></tr>
<tr><td>Expo Go</td><td>SDK 54-compatible</td></tr>
<tr><td>Test device</td><td>Pixel 9</td></tr>
</table>

## Architecture

Migration is ~85% complete. `App.tsx` is dead code (marked `// TODO delete me`). Expo Router Drawer is the active navigation. All live screens are under `expo54/src/app/v2/(public)/`.

| Aspect         |          legacy          |                             v2 (active)                              |
| -------------- | :----------------------: | :------------------------------------------------------------------: |
| Routing        |  React Navigation stack  |                          Expo Router Drawer                          |
| Entry point    |   `App()` — dead code    |              `v2/(public)/index.tsx` → `CreateThought`               |
| `App.tsx`      |         ✅ used          |                             ❌ dead code                             |
| React Compiler |            ❌            |                                  ✅                                  |
| AsyncStorage   |        scattered         |                      `src/hooks/use-storage.ts`                      |
| Feature flags  | `src/legacy/feature.tsx` |                         ❌ no v2 equivalent                          |
| Test suite     |            —             | 17/17 ✅ (6 suites skip — pre-existing TS type error in `routes.ts`) |

## Migration Status — Screen by Screen

| Screen                | v2 exists | Notes                      |
| --------------------- | :-------: | -------------------------- |
| `thoughts/create`     |    ✅     | Missing #603 buttons       |
| `thoughts/index`      |    ✅     |                            |
| `thoughts/[id]/index` |    ✅     |                            |
| `thoughts/[id]/edit`  |    ✅     |                            |
| `settings/index`      |    ✅     | Missing dark mode (#8)     |
| `settings/backup`     |    ✅     |                            |
| `settings/export`     |    ✅     |                            |
| `settings/lock`       |    ✅     |                            |
| `help/index`          |    ✅     |                            |
| `help/intro`          |    ✅     | Needs device testing (#21) |
| `debug/`              |    ✅     | Dev-only                   |
| `lock-update`         |    ❌     | No v2 equivalent found     |

## Open Issues → Present in expo54?

| Issue                                                 | Title                                      | In expo54? | Notes                                                                                                                                                   |
| ----------------------------------------------------- | ------------------------------------------ | :--------: | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#687](https://github.com/erosson/freecbt/issues/687) | Language picker should use English list    |     ✅     | Already fixed — `en.json` uses native names by design · picker behavior correct on master                                                               |
| [#603](https://github.com/erosson/freecbt/issues/603) | Save and add another / go to index buttons |     ❌     | Missing from `v2/thoughts/create.tsx` · one submit button only · `Routes.thoughtCreateV2()` + `Routes.thoughtListV2()` exist · translation keys missing |
| [#21](https://github.com/erosson/freecbt/issues/21)   | Help > intro blank on iPad until swipe     |     🔲     | `v2/help/intro.tsx` exists — needs device testing                                                                                                       |
| [#8](https://github.com/erosson/freecbt/issues/8)     | Dark mode                                  |     ❌     | No `colorScheme`/`useColorScheme` usage found                                                                                                           |

## Contribution Paths

|     | Option                                  | Scope |                              Risk                              |
| :-- | --------------------------------------- | :---: | :------------------------------------------------------------: |
| A   | Fix #603 — save and add another buttons | Small | ![](https://img.shields.io/badge/-Low-green?style=flat-square) |
| B   | Fix #8 — dark mode                      | Large | ![](https://img.shields.io/badge/-High-red?style=flat-square)  |
| C   | Fix #21 — help intro blank              | Small | ![](https://img.shields.io/badge/-Low-green?style=flat-square) |

## Log

| Date       | Update                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-14 | Audit started · app boots · wireless ADB confirmed · 4 errors on first load                                                       |
| 2026-07-14 | First screens captured · expo54 UI diverges from production — layout, theme, nav                                                  |
| 2026-07-14 | Static analysis · structural rewrite confirmed · ~47 src files missing vs expo47                                                  |
| 2026-07-14 | Deep inspection · home screen missing · guide/intro boilerplate · i18n locale picker commented out                                |
| 2026-07-14 | #687 investigated · not reproducible on master · `en.json` uses native names by design · branch discarded                         |
| 2026-07-14 | #603 investigated · feature absent from v2 create screen · implementation path identified                                         |
| 2026-07-14 | Entry point confirmed · `App.tsx` dead code · Expo Router Drawer active · v2/(public)/ is live codebase · migration ~85% complete |



# Dev Notes

Investigation and issue logs from contributor audits.

| # | File | Summary |
|---|------|---------|
| 001 | [legacy-screens-crash](issue-001-legacy-screens-crash.md) | Dead `(legacy)/` screens crash Expo Go via `expo-notifications`, blocking dark mode toggle |
