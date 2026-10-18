# Mobile documentation

The phone companion connects to a dash over BLE for in-car telemetry. It is the
newest surface of the project and deliberately narrow: it reads live data and
sends a small command set, but it does not configure the dashboard — that is the
[tuner's](https://github.com/CANShift/canshift-tuner/tree/main/docs) job. It can
update the dash's firmware over the dash's Wi-Fi in workshop mode.

| Doc                                         | What it covers                                       |
| ------------------------------------------- | ---------------------------------------------------- |
| [Companion app](companion-app.md)           | What the app does today, and what it does not        |
| [Pairing over BLE](pairing.md)              | Permissions, scan, bonding, and automatic reconnect  |
| [Firmware update](firmware-update.md)       | Updating the dash over its workshop-mode Wi-Fi       |
| [Redesign handoff](redesign/HANDOFF.md)     | The approved redesign spec and its reference mockups |
| [Native build and tooling](native-build.md) | Why each config plugin and tooling workaround exists |

BLE only exists on firmware built with it compiled in — see
[transports](https://github.com/CANShift/canshift-firmware/blob/main/docs/architecture/transports.md)
and [BLE transport](https://github.com/CANShift/canshift-firmware/blob/main/docs/architecture/ble-transport.md).

Docs for the other repos: [firmware](https://github.com/CANShift/canshift-firmware/tree/main/docs) ·
[tuner](https://github.com/CANShift/canshift-tuner/tree/main/docs) ·
[core](https://github.com/CANShift/canshift-core/tree/main/docs)
