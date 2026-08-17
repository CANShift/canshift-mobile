# Pairing over BLE

Bluetooth is the mobile companion's link to the dash. (The desktop Tuner uses Web Serial instead — see the [Tuner tour](https://github.com/CANShift/canshift-tuner/blob/main/docs/tour.md).) Pairing only works when the firmware was built with BLE compiled in; see [Transports](https://github.com/CANShift/canshift-firmware/blob/main/docs/architecture/transports.md).

## The flow

1. **Grant Bluetooth permission.** On first launch the app asks for the OS Bluetooth permission (`src/services/ble-permissions.ios.ts` / `.android.ts`); scanning does nothing until it's granted.
2. **Scan.** The scan screen (`src/screens/ScanScreen.tsx`) lists nearby dashes. If Bluetooth is off it prompts you to turn it on rather than sitting blank.
3. **Connect and bond.** Select your dash to connect (`src/services/ble.service.ts`). The dash shows a six-digit passkey on its screen to confirm the bond — that's the firmware's `PASSKEY` GATT characteristic, covered in [BLE transport](https://github.com/CANShift/canshift-firmware/blob/main/docs/architecture/ble-transport.md).

## Staying connected

The app remembers the last dash it bonded with (`src/services/last-device.ts`) and reconnects to it automatically on the next launch. If the link drops, a reconnect banner (`components/ReconnectBanner.tsx`) retries in the background (`src/services/ble-reconnect.ts`); if it can't recover, a dialog offers to scan again.

> [!NOTE]
> BLE is a secondary, in-car convenience link. It carries telemetry and a small command set, not the full configuration surface — burn a full config from the [Tuner](https://github.com/CANShift/canshift-tuner/blob/main/docs/configure/with-tuner.md) over USB.
