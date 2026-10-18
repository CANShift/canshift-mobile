import {
  dispatchBleError,
  type BleConnectionError,
  type BleErrorTable,
} from "./ble.errors";
import { STRINGS } from "../strings";

export interface BleErrorMessage {
  title: string;
  body: string;
}

const connectionFailed = (): BleErrorMessage => ({
  title: "Connection failed",
  body: STRINGS.genericError,
});

const MESSAGE_BY_KIND: BleErrorTable<BleErrorMessage> = {
  "bluetooth-off": () => ({
    title: "Bluetooth is off",
    body: "Turn Bluetooth on to connect to your dashboard.",
  }),
  "not-paired": () => ({
    title: "Device not found",
    body: "The dashboard is not advertising. Power-cycle it and scan again.",
  }),
  "not-in-range": () => ({
    title: "Device out of range",
    body: "Move closer to the dashboard and try again.",
  }),
  disconnected: () => ({
    title: "Disconnected",
    body: "The dashboard disconnected. Try connecting again.",
  }),
  "characteristic-missing": () => ({
    title: "Incompatible firmware",
    body: "This dashboard is missing required BLE services. Update the firmware.",
  }),
  "write-failed": connectionFailed,
  "permission-denied": (err) => ({
    title: "Bluetooth permission needed",
    body:
      err.platform === "android"
        ? "CANShift needs nearby devices permission. Open app settings to grant it."
        : "CANShift needs Bluetooth access to find your dashboard.",
  }),
  "telemetry-version": () => ({
    title: "Update needed",
    body: "The dash sends live data in a format this app can’t read. Update the app or the dash firmware.",
  }),
  "telemetry-malformed": () => ({
    title: "Live data unreadable",
    body: "The dash sends live data this app can’t read. Reconnect, and update the app or the dash firmware if it keeps happening.",
  }),
  unknown: connectionFailed,
};

export const bleErrorMessage = (err: BleConnectionError): BleErrorMessage =>
  dispatchBleError(MESSAGE_BY_KIND, err);
