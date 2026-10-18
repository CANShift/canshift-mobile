# Native build and tooling

The repo keeps zero comments, so the reasons behind the native config plugins and the tooling workarounds live here.

## Config plugins (`plugins/`)

| Plugin                              | What it changes                                                                                            | Why                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `withGlogFmtFix`                    | Builds the `fmt` and `glog` pods as `gnu++17`, in the target build settings and in their xcconfig files    | Clang 18+ (Xcode 16+) defines `__cpp_consteval` under C++20, which makes fmt's `FMT_STRING` consteval-only and breaks React Native's bundled fmt (`call to consteval function … is not a constant expression`). The pbxproj setting wins over the xcconfig; the xcconfig is patched too in case CocoaPods rewrites it. |
| `withSilencePodsWarnings`           | Turns off noisy Clang warning categories on Pods targets                                                   | Drops several hundred lines of third-party warnings from a clean build. `installer.pods_project.targets` covers Pods only, so warnings from the app's own code still show.                                                                                                                                             |
| `withPodfilePostInstall`            | Shared helper: inserts a patch once, before the `end` that closes `post_install`, guarded by a marker line | Lets each Podfile plugin run on every prebuild without stacking duplicates. It fails loudly when the Expo template changes shape.                                                                                                                                                                                      |
| `withBluetoothScanNeverForLocation` | Android: flags `BLUETOOTH_SCAN` as `neverForLocation` and caps `ACCESS_FINE_LOCATION` at API 30            | The app never derives location from BLE. Without it, Play review flags location use and Android 12+ users get a location prompt the BLE stack no longer needs.                                                                                                                                                         |

## Dependency overrides (`scripts/check-overrides.js`)

Runs before install and refuses npm overrides known to break Expo:

- `tar` 7, global or nested under any package (for example `@expo/cli` or `cacache`): `@expo/cli` uses the tar 6 `extract()` API, and `expo prebuild` fails with tar 7.
- `@xmldom/xmldom` 0.9: breaks `@expo/plist`'s `parseFromString`. The override pins the 0.8 LTS line, which carries the CVE fixes.

## Jest (`jest.config.js`)

- `@canshift/core` ships ESM, so it stays in the `transformIgnorePatterns` allowlist and jest transpiles it.
- Coverage is off by default (`npm run test:coverage` turns it on); the thresholds stop regressions at the suite's current breadth.

## Lint scope

`eslint .` checks `src/` with the full type-checked rule set, and every other JS or TS file in the repo (`plugins/`, `scripts/`, the root config files) for comments with the same rule.
