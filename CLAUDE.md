# canshift-mobile — Project Rules

iPhone companion app for the CANShift dashboard (org: github.com/CANShift). Expo SDK 54 (prebuild) · React Native 0.81 · React 19 · Zustand · react-native-ble-plx. iOS-first; the package is currently deferred — verify in-simulator only unless told otherwise.

## Commands

- `npm run typecheck` / `test` (jest) / `lint` / `format:check`
- `npx expo prebuild --clean --platform ios` then `npm run ios` for native builds

## Rules

- `@canshift/core` comes from npm (jest transforms it — keep it in `transformIgnorePatterns`' allowlist).
- Zero comments policy; TS strict; arrow functions; wire JSON snake_case at boundaries.
- BLE state machine lives in `BleService`; don't scatter BLE calls in components.
- Since the firmware WiFi stack removal, there is no mobile OTA — firmware updates go through the tuner's USB flasher.

## Code shape

Non-negotiable. Reviewed on every PR, ahead of feature count.

- Guard clauses first. Nesting depth 2 max — a third level means extract a named function.
- One `try` per function. Never a `try` inside a `try`, a `catch` or a `finally`. No empty catch, no catch that only logs. A failure that cannot reach the UI is a bug — storage and BLE paths included.
- One error taxonomy, `ble.errors.ts`. Never a second one built on message substrings, never an error class faked with a cast, never re-wrap an error in a way that drops its code.
- Report a failure on exactly one channel. Setting store error state _and_ rethrowing means the user sees it up to three times.
- Stacked `cond && <X/>`, chained ternaries and mutually-exclusive booleans are a union that lost its type. Derive one named state value and render it from a `Record<Kind, …>`.
- ~30 lines per function, ~300 per file. Screens hold layout only — data, animation and copy tables live in `hooks/`, `lib/` and `services/`.
- Every reusable component gets its own file with a props interface. One implementation per component name.
- Third copy gets extracted. Cross-file boilerplate (error→string, storage guards, tick hooks) lives in one shared helper under `src/lib/` and is imported, never re-typed.
- Lap detection, telemetry codecs and schemas come from `@canshift/core` — never reimplemented, never restated field-by-field.

## Workflow

- Branch `type/short-description`; Conventional Commits, subject only.
- PR via `gh pr create`; required checks `lint`, `typecheck`, `test`; **rebase and merge only**.
- iOS native workflow runs on native-config changes + manual dispatch only.
