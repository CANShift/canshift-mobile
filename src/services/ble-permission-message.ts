import type { BlePermissionState } from "./ble.service";

export interface PermissionMessage {
  title: string;
  body: string;
}

type AlertableState = Exclude<
  BlePermissionState["kind"],
  "ok" | "unauthorized"
>;

const PERMISSION_MESSAGES: Record<AlertableState, PermissionMessage> = {
  powered_off: {
    title: "Bluetooth is off",
    body: "Turn Bluetooth on to scan for your dashboard.",
  },
  unsupported: {
    title: "Bluetooth unavailable",
    body: "This device doesn't support Bluetooth Low Energy.",
  },
  resetting: {
    title: "Bluetooth restarting",
    body: "Bluetooth is resetting. Try again in a moment.",
  },
  unknown: {
    title: "Checking Bluetooth",
    body: "Bluetooth state is not yet available. Try again in a moment.",
  },
};

export const blePermissionMessage = (kind: AlertableState): PermissionMessage =>
  PERMISSION_MESSAGES[kind];
