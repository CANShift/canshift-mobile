# Mobile companion

> [!WARNING]
> The mobile app is **not released yet** and is iOS-first while it's in development. What follows describes what the code in `canshift-mobile` implements today — treat it as a preview, not a shipped feature, and expect things to move.
> The companion ([canshift-mobile](https://github.com/CANShift/canshift-mobile)) is a phone app for reading the dash in the car, where a laptop isn't practical. It connects over BLE — [pairing is here](pairing.md) — and mirrors the dash's telemetry on your phone.

## Stack

Expo SDK 58 (bare workflow via prebuild), React Native 0.88, TypeScript, `react-native-ble-plx` for Bluetooth. iOS is the primary target; the Android build works but gets less testing, and iPad is intentionally disabled (`supportsTablet: false`). The look follows the [redesign handoff](redesign/HANDOFF.md): dark only, read at arm's length, 56 pt targets on driving screens.

## What's in it today

Before a dash is linked the app is one **Scan** screen (Bluetooth pre-prompt, scan, pairing, demo mode, app info). Once linked, four tabs, with the link state in the header (or a left rail in landscape):

| Tab        | What you get                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| **Live**   | Eight value tiles, a 12-segment shift light, the update rate, and a Display sheet (dash brightness, keep screen on) |
| **Graph**  | Up to four signals over 30 s, 1 min or 2 min; pause, clear, CSV export                                              |
| **Laps**   | GPS timing (fix, start/finish line, track mode, laps vs best) or the dash-synced timer                              |
| **Device** | Connection, telemetry logging, the Console (Log, Send, CAN), dash and app info, firmware update, phone settings     |

## How it shows trouble

- **Stale values.** Each signal goes stale 2 s after its last update: dashed tile, grey value, "{n} s ago". A link that sends nothing for 2 s shows NO DATA. Values never keep their live colours.
- **Critical alerts.** The phone mirrors the dash's full-screen alert from the dash's ALERT characteristic: every active alert at once, each with its own Acknowledge (sent back to the dash), one Mute for this session. A session lasts until you pick a dash from the scan list again or the app restarts; an automatic reconnect keeps it. An acknowledged or muted alert stays as a red strip under the header until it clears. On firmware without that characteristic, or in demo mode, the phone decides alerts from core's default danger bands.
- **Notifications.** With the app in the background or the phone locked, the BLE link keeps running and the phone posts a local notification with sound when a critical alert starts firing: one per alert onset, never for an acknowledged or muted alert, removed from the notification centre when the alert clears or is acknowledged. Tapping it opens the app, where the alert takeover is up. A link that drops on its own (not a user disconnect, not demo mode, not the workshop-mode handoff) posts "Dash disconnected" once, removed on reconnect. In the foreground the takeover is enough, so nothing is posted. The phone asks for notification access after the first dash connection, not at launch; if it is refused, everything else works and Device › This phone says so, with a button to Settings.
- **One overlay order.** Critical alert, firmware update, reconnect failed, reconnecting banner, alert strip, phone battery low: the top one wins on every screen.

## What it is not

It is not the configuration tool. Editing the dashboard, binding signals and burning a config is the [Tuner's](https://github.com/CANShift/canshift-tuner/blob/main/docs/tour.md) job; the phone is for watching, not building. The one exception is the [firmware update](firmware-update.md), which goes over the dash's Wi-Fi in workshop mode, not over BLE. That split is deliberate — BLE carries telemetry and a small command set, not the full contract ([Transports](https://github.com/CANShift/canshift-firmware/blob/main/docs/architecture/transports.md)).
