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

## Workflow

- Branch `type/short-description`; Conventional Commits, subject only.
- PR via `gh pr create`; required checks `lint`, `typecheck`, `test`; **rebase and merge only**.
- iOS native workflow runs on native-config changes + manual dispatch only.
