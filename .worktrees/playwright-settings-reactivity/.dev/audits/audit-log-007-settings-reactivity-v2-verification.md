<div align="center">

# FreeCBT — Settings Reactivity in the v2 Architecture (Issue #7)

_log of stuff done/found._

Sources: GitHub issue `dndrade/freecbt#7` · code inspection (`expo54/src/model/*`,
`expo54/src/hooks/*`, `expo54/src/app/v2/**`, `expo54/src/view/*`) · `yarn jest`
(this checkout, 2026-07-24) · `yarn tsc --noEmit`

</div>

## Issue #7

I wanted to confirm that the v2 shared model eliminated the legacy settings-propagation bug, for
five settings — locale, theme, reminder state, history-label selection, and
PIN-related state — without navigating away or restarting. Acceptance criteria: each
setting change is visible immediately anywhere its value is rendered.

## Architecture found

A single `ModelProvider` (React Context + `useReducer`, elm-arch pattern) sits at the
app root (`expo54/src/hooks/use-model.tsx`, `use-elm-arch.tsx`). Every v2 screen reads
state exclusively via `useModel()` → `LoadModel`. There is no per-screen local
`useState` mirror of a setting, and no `AsyncStorage` re-read on the render path —
settings render straight from `model.settings.*` (or a `Model.colorScheme`/
`Model.locale` derivation) on every render. Structurally, staleness would require
either a component reading a stale prop copy instead of `useModel()`, or a memoized
value with a wrong/missing dependency array. Grepping every `settings.<field>` read
site in `src/` confirms none of the five settings has a second, divergent read path.

## Setting-by-setting map

| Setting       | Authoritative state                                          | Visible consumers                                                                                                                         | Propagation path                                                                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme         | `model.settings.theme`                                       | every v2 screen, via `useStyle`/`useTheme(Model.colorScheme(model))`                                                                      | `Action.setTheme` → `model.ts:updateSettings` → new `model` object → context re-render → all consumers recompute `Model.colorScheme`                                                                                             |
| Locale        | `model.settings.locale`                                      | every `useTranslate()` call site, via `ModelI18nProvider` (`app-provider.tsx`)                                                            | `Action.setLocale` → `updateSettings` → `ModelI18nProvider` re-renders, builds a **new** `I18n` instance (not memoized) from `Model.locale(m)` → `I18nProvider` context value changes → all `useTranslate()` consumers re-render |
| Reminders     | `model.settings.reminders` (bool)                            | only the settings screen's own toggle (`RemindersForm`); OS notification scheduling is a side effect, not a second visible React consumer | `reminders.set()` → `Cmd` (schedule notif) + `Action.setReminders` → `updateSettings` → same screen re-renders                                                                                                                   |
| History label | `model.settings.historyLabels`                               | `thoughts/index.tsx` list, via `Thought.label(thought, model)`                                                                            | `Action.setHistoryLabel` → `updateSettings` → thoughts list re-renders with new label field                                                                                                                                      |
| PIN           | `model.settings.pincode`, plus derived `model.sessionAuthed` | `AuthGateway` (lock gate), `settings/index.tsx` (`isSet`), `lock.tsx` (set/update flow)                                                   | `Action.setPincode` → `updateSettings` (also sets `sessionAuthed = !!value`) → `AuthGateway` re-evaluates its gate condition immediately                                                                                         |

No legacy AsyncStorage-polling pattern remains in the v2 tree for any of these five
settings; every read site resolves through the single shared model.

## Verification plan and what was actually run

Split into three tiers, per issue #7's own ask to separate static / automated /
device-required confirmation:

1. **Static (code-reading)** — the map above; all five settings trace to a single
   reactive source with no divergent copies.
2. **Automated (jest, jsdom + testing-library)** — added one test asserting that a
   `dispatch()` for each of the five settings actions, run through the _real_
   `ModelProvider`/`useModel()` stack (not just the pure reducer, which
   `model.test.ts` already partly covered for `theme` only), produces the expected
   change in both `model.settings` and that setting's derived consumer function
   (`Model.colorScheme`, `Model.locale`, `Thought.label`, the `AuthGateway` gate
   condition). This closes the coverage gap where only `theme` had hook-level
   assertions before.
3. **Manual, device-required** — anything needing actual on-screen visual
   confirmation in real time; listed below, not executed (no simulator/device in this
   environment).

Deliberately **not** done: full component-tree rendering of each screen (would
require mocking `expo-router`/navigation for marginal value, since the shared
derivation functions are already unit-tested directly).

## Result

**No problem found.** All five settings pass static and automated verification; no
propagation break was isolated, so no fix was made.

| Setting       | Static | Automated | Manual (remaining)                                                  |
| ------------- | ------ | --------- | ------------------------------------------------------------------- |
| Locale        | pass   | pass      | required — visual string re-render                                  |
| Theme         | pass   | pass      | required — visual color re-render                                   |
| Reminders     | pass   | pass      | required — OS permission/notification behavior                      |
| History label | pass   | pass      | required — on-screen list re-render                                 |
| PIN           | pass   | pass      | required — live lock/unlock gating across app background/foreground |

## Files changed

- `expo54/src/hooks/use-model.test.tsx` — added
  `use-model settings propagate through context for every consumer`, exercising all
  five settings actions through the real `ModelProvider` and asserting both raw state
  and each setting's derived consumer update together.

## Commands and results

- `npx jest src/hooks/use-model.test.tsx src/hooks/use-elm-arch.test.tsx src/model/model.test.ts src/model/settings.test.ts` → 4 suites / 9 tests pass
- `npx jest` (full suite) → 18 suites / 70 tests pass
- `npx tsc --noEmit -p .` → same 9 pre-existing errors as before this change (legacy
  `App.tsx` module paths under `(legacy)/`, and an unrelated `never`-type error in
  `src/app/v2/debug/demos/hooks-init/use-model2.tsx`) — nothing new introduced;
  confirmed by `git diff --stat` touching only the one test file

## Remaining manual device test steps

Cannot be completed in this environment (no simulator/device). Exact steps, without
navigating away or restarting:

1. **Theme** — Settings screen, tap Light/Dark/Default. Confirm colors change
   immediately on that screen, then navigate to the Thoughts list without restarting
   and confirm it already reflects the new theme.
2. **Locale** — Settings screen, change locale in the picker. Confirm drawer labels,
   headers, and all settings-screen text switch immediately, without navigating away.
3. **Reminders** (iOS only, per `useReminders().isSupported()`) — toggle on: confirm
   the OS permission prompt appears and the button state updates immediately on
   grant/deny. Toggle off: confirm the scheduled notification is cancelled.
4. **History label** — change selection, go to the Thoughts list. Confirm each
   thought's displayed label (alternative vs. automatic thought) updates immediately
   without reload.
5. **PIN** — set a PIN via the lock flow, then background and foreground the app.
   Confirm `AuthGateway` immediately requires the PIN. Clear the PIN: confirm the
   gate opens immediately without restart.
   </content>
