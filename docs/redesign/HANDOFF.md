# CANShift Mobile — redesign handoff

Implementation spec for the new look of the Mobile app (React Native / Expo, iPhone,
BLE). The mockups are in `design/M-*.dc.html`. They are HTML with inline styles, written
for a design-canvas runtime (`<x-dc>`, `{{holes}}`, `<sc-for>`, `<dc-import>`), so they
won't render on their own: **read them as reference** for layout, sizes, colours and
copy. Rebuild them with React Native primitives.

Same design language as the Tuner (see the Tuner `HANDOFF.md`): same tokens, same
connection vocabulary, same error tone, same full-screen-alert cue.

**No feature is removed.** Every feature from today's app is listed in §7 with its
new place.

## 0. Ground rules

- Dark only. iPhone portrait first, landscape for the car mount (Live, Laps, Critical alert).
- Read at arm's length. Live numbers are monospace, **44 pt or more** on Live, **72 pt or more** for the lap chrono, **120 pt or more** for the alert value.
- Touch targets: 44 pt minimum everywhere, **56 pt on driving screens**, **88 pt or more** for
  Capture lap, Start/Resume and Acknowledge (gloves).
- State is always written in words (Warning, Danger, "6 s ago", RUNNING…), never shown by colour alone.
- Plain language. Never show a raw error code (log it instead).
- Keep the screen awake while connected (`expo-keep-awake`), with an option in the Display sheet.

## 1. Navigation

Four tabs, plus a pushed screen and overlays:

| Tab        | Was    | Contents                                                                                               |
| ---------- | ------ | ------------------------------------------------------------------------------------------------------ |
| **Live**   | Dash   | Shift light · 8 value tiles · link footer · **Display** sheet (brightness, keep screen on)             |
| **Graph**  | Graph  | Time window 30 s / 1 min / 2 min · signal strip · chart · Pause/Resume · Clear · Export · picker sheet |
| **Laps**   | Track  | Segmented **GPS timing / Dash timer**                                                                  |
| **Device** | Device | Connection · Telemetry logging · Console › (pushed: Log / Send / CAN) · info · Demo mode               |

Why: each tab is a different moment (driving, looking back, timing, setup), so they stay
separate. Dash → **Live** so it isn't confused with the physical dash, and Track → **Laps** because it says what you get.

Before connecting there are no tabs. The Scan stack is: Bluetooth pre-prompt (first run) →
Scan (empty / scanning / found / denied) → pairing sheet. App info is an (i) button there.

Landscape: the tab bar becomes a **96 pt left rail** (`MRail`) with a connection dot at the top.

## 2. Overlay priority (top wins)

1. **Critical alert**, full screen. Covers tabs and header and blocks other input.
2. **Reconnect failed** dialog.
3. **Reconnecting** banner under the header (68 pt, with Cancel → back to Scan).
4. **Acknowledged / muted alert strip**: solid red, under the header, on every tab while the condition lasts.
5. **Phone battery low** banner (dismissable; reappears at 5 %).

Implement this as a single `OverlayHost` at the root that renders from one store, so the order can't be broken by a screen.

## 3. Critical alerts — rules

- An alert raised by the dash → full-screen takeover (+ haptics, + sound unless muted).
- It shows: signal title (caps), value (huge), limit ("Limit: below 1.0 bar"), context rows (RPM, oil temp, "Since 0:12").
- **Several active alerts → all of them are on screen at once**, as stacked cards, newest first, each with its own **Acknowledge**. One shared **Mute all for this session**.
- **Acknowledge** removes that alert's takeover. While its condition lasts it becomes a red strip ("Acknowledged · still active", **Show** reopens it). Other alerts stay full screen.
- **Mute for this session**: no takeover and no sound for that signal until the app restarts. The strip stays ("Muted for this session", **Unmute**). A **new** alert on a different signal still takes over.
- When the condition clears, the strip disappears and a toast says "Oil pressure is back to normal."
- Visual cue = Tuner: **solid `#D63333` + Maximize (frame-corners) icon**. Never used for a tile. Tiles use outlined orange (warning) and outlined red + tint (danger).

## 4. Live data and staleness

```
link        : 'scanning' | 'connecting' | 'connected' | 'reconnecting' | 'offline' | 'demo'
signal[id]  : { value, unit, state: 'normal'|'warning'|'danger', lastAt }
```

- A signal is **stale** when `now - lastAt > 2 s` (configurable). Stale tile: dashed `#3A3F46` border, grey value `#6B7178`, clock icon + "{n} s ago". Never keep the live colours.
- If no frame at all for over 2 s while linked: orange **NO DATA** banner ("Nothing from the dash for {n} s. Values below are the last ones received."), shift light off, all tiles stale.
- A signal that never arrived: value "—", tag "No data".
- While reconnecting: all tiles stale, footer "Paused while reconnecting", Graph pauses automatically.
- Footer (Live): link dot + "Live · {n} updates/s".

## 5. Tokens

| Token        | Value                                                                    | Use                                                      |
| ------------ | ------------------------------------------------------------------------ | -------------------------------------------------------- |
| bg           | `#0E0F11`                                                                | app background                                           |
| surface      | `#16181B`                                                                | cards, sheets, tab bar                                   |
| surface2     | `#1E2125`                                                                | segmented track, disabled buttons, off segments          |
| border       | `#2B2F35` · row `#23262B` · strong `#3A3F46`                             |                                                          |
| text         | `#F2F3F5` · secondary `#C9CDD2` · muted `#A0A6AD` · stale `#6B7178`      |                                                          |
| accent       | `#FF4747`                                                                | active tab icon, LOGGING dot                             |
| primaryBtn   | `#D63333`                                                                | Scan, Start, Resume, Send, alert background (white text) |
| warning      | `#FF8800` · bg `#2A1C0A` · text `#FFC27A` / `#FFD9A8` · border `#5A3A12` |                                                          |
| danger tile  | border `#FF4747` · bg `#2A1010` · value `#FF6B6B` · label `#FFB3B3`      |                                                          |
| success      | `#3DD68C` · bg `#123826` · text `#B8F2D3`                                |                                                          |
| chart series | `#F2F3F5`, `#4DA3FF`, `#B78CFF` (dashed), 4th `#FFD166`                  | not red/orange/green, which carry meaning                |

- Radius 10 (buttons, inputs) · 12–14 (cards, tiles) · 16 (sheets, big buttons).
- Fonts: system (SF Pro). Numbers: `Menlo` on iOS (or `fontVariant: ['tabular-nums']` with SF Mono if bundled). Tile labels caps, 14 pt, letter-spacing 0.06em.
- Shift light: 12 segments, green ×6, orange ×3, red ×3; off = surface2.

## 6. Components (React Native primitives only)

| UI                                                           | Build with                                                                                                     |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `Header` (conn dot + label + dash name + LOGGING/DEMO badge) | `View`/`Text`; props `link`, `dashName`, `badge` (see `MHeader.dc.html`)                                       |
| `TabBar` / `Rail`                                            | `@react-navigation/bottom-tabs` with a custom `tabBar`; rail in landscape (`useWindowDimensions`)              |
| `ValueTile`                                                  | `View` + `Text`; props `label`, `value`, `unit`, `state` (`normal`/`warning`/`danger`/`stale`/`nodata`), `age` |
| `ShiftLight`                                                 | row of 12 `View`s                                                                                              |
| `Segmented`                                                  | `Pressable`s in a `View` (`accessibilityRole="tab"`/`"button"`, `accessibilityState.selected`)                 |
| `Banner` (warning / reconnect / battery / no data)           | `View` under the header, from `OverlayHost`                                                                    |
| `AlertTakeover`, `AlertStrip`                                | `Modal` (`presentationStyle="fullScreen"`, `statusBarTranslucent`) + `ScrollView` of `AlertCard`s              |
| Sheets (pairing, picker, Display)                            | `@gorhom/bottom-sheet` or `Modal` with `animationType="slide"`                                                 |
| Dialogs (reconnect failed, Reset, Clear)                     | `Modal` (transparent) with a card                                                                              |
| Chart                                                        | `react-native-svg` `Polyline`s (or `victory-native`/Skia if already used). No web-only chart libs              |
| Lists (laps, log, CAN frames, devices)                       | `FlatList`                                                                                                     |
| Buttons                                                      | `Pressable` with `hitSlop` so the touch area is at least 44 pt                                                 |

No web-only components (no DOM, no CSS hover, no `div`).

## 7. Feature map — nothing removed

| Today                                                                                                                          | New place                                                               |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Scan, device list, tap to connect, pairing code                                                                                | Scan stack (`M-Scan-*`)                                                 |
| Scan again / Stop scanning                                                                                                     | Scan screens                                                            |
| Reconnect strip + Cancel                                                                                                       | `M-Scan-Reconnecting` (before tabs), `M-Banner-Reconnect` (inside tabs) |
| Demo simulation / End demo                                                                                                     | Scan "Try demo mode" · Device > Demo mode card > **End demo**           |
| Device & app info from Scan                                                                                                    | (i) button on Scan                                                      |
| First-run Bluetooth permission · reconnect-failed dialog                                                                       | `M-Scan-Permission` · `M-Reconnect-Failed`                              |
| Dash tab: tiles, shift light, top-bar link status (NO DATA), footer, brightness                                                | Live (`M-Live-*`); brightness in the Display sheet                      |
| Graph: picker sheet, strip, 30 s/1 min/2 min, Pause/Resume, Clear, Export, empty state                                         | Graph (`M-Graph-*`)                                                     |
| GPS lap timing: Start/Stop track mode, Set/Reset line, fix & permission states, chrono, stats, laps                            | Laps > GPS timing (`M-Laps-*`)                                          |
| Dash-synced lap timer: Start, Pause, Resume, Reset, Capture lap, READY/RUNNING/PAUSED, SYNCED / PHONE ONLY, can't-save warning | Laps > Dash timer (`M-Timer-*`)                                         |
| Device: status, Disconnect/Reconnect, info (name, ID, firmware, config schema, app version, dash battery)                      | Device (`M-Device*`)                                                    |
| Telemetry logging: buffer, LOGGING, Stop logging now                                                                           | Device logging card + LOGGING badge in the header                       |
| Console: Log (pause, filter), Send, CAN                                                                                        | Device > Console (`M-Console-*`); CAN has empty + filled states         |
| Critical alert, multiple alerts, Acknowledge, Mute                                                                             | `M-Alert-*`                                                             |
| Phone battery low                                                                                                              | `M-Battery-Low`                                                         |

## 8. Copy

Every string is in `design/M-Copy.dc.html`. Centralise them in `src/strings.ts`.
Connection labels are identical to the Tuner: **Connected · Reconnecting… · Not connected** (plus Searching…, Demo).

## 9. Acceptance checklist

- [ ] Every row of §7 is reachable in at most 2 taps from a tab (Console: 2).
- [ ] Live, Laps and Critical alert work in landscape with the left rail; nothing is cut off at 844×390.
- [ ] All driving-screen targets are ≥ 56 pt; Capture lap, Start, Resume and Acknowledge are ≥ 88 pt tall.
- [ ] Unplugging the dash: within 2 s all tiles turn stale (dashed, grey, age) and the NO DATA or Reconnecting banner shows. No value keeps live colours.
- [ ] Two alerts at once: both visible; acknowledging one keeps the other full screen; the acknowledged one shows as a strip on every tab.
- [ ] Mute: no takeover or sound for that signal until restart; a different signal still takes over.
- [ ] The critical alert covers tabs, sheets and dialogs (it's on top of every `Modal`).
- [ ] Reconnect banner Cancel returns to Scan; Reconnect failed offers Try again + Scan for dashes.
- [ ] Phone-only timer shows the PHONE ONLY tag and explanation; can't-save warning appears when storage fails.
- [ ] Demo mode shows the DEMO badge on every screen and End demo under Device.
- [ ] VoiceOver reads tile label + value + state ("Oil temp, 112 degrees, warning").
- [ ] Text contrast ≥ 4.5:1 (white on `#D63333` is 4.9:1); no raw error codes anywhere.
