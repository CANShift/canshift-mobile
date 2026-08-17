# Mobile companion

> [!WARNING]
> The mobile app is **not released yet** and is iOS-first while it's in development. What follows describes what the code in `canshift-mobile` implements today — treat it as a preview, not a shipped feature, and expect things to move.
> The companion ([canshift-mobile](https://github.com/CANShift/canshift-mobile)) is a phone app for reading the dash in the car, where a laptop isn't practical. It connects over BLE — [pairing is here](pairing.md) — and mirrors the dash's telemetry on your phone.

## Stack

Expo SDK 54 (bare workflow via prebuild), React Native 0.81, TypeScript, `react-native-ble-plx` for Bluetooth. iOS is the primary target; the Android build works but gets less testing, and iPad is intentionally disabled (`supportsTablet: false`).

## What's in it today

The screens that exist in the source (`src/screens/`):

- **Dash** — the key signals live (rpm, speed, gear up top, more below), pulled off the BLE telemetry stream.
- **Graph** — a signal plotted over time.
- **Timer** and **Track** — a lap timer and a GPS-driven track mode for on-track use.
- **Log** — the dash's recent log lines.
- **Settings** and **About** — connection and app info.

## What it is not

It is not the configuration tool. Editing the dashboard, binding signals and burning a config is the [Tuner's](https://github.com/CANShift/canshift-tuner/blob/main/docs/tour.md) job over USB; the phone is for watching, not building. That split is deliberate — BLE carries telemetry and a small command set, not the full contract ([Transports](https://github.com/CANShift/canshift-firmware/blob/main/docs/architecture/transports.md)).
