import { State } from "react-native-ble-plx";
import { currentPlatform } from "../../lib/platform";
import { BlePermissionDeniedError } from "../ble.errors";
import type { AndroidBlePermissionResult } from "../ble-permissions";

export type BlePermissionState =
  | { kind: "ok" }
  | { kind: "powered_off" }
  | { kind: "unauthorized"; platform: "ios" | "android" }
  | { kind: "unsupported" }
  | { kind: "resetting" }
  | { kind: "unknown" };

export const blePermissionStateFrom = (state: State): BlePermissionState => {
  switch (state) {
    case State.PoweredOn:
      return { kind: "ok" };
    case State.PoweredOff:
      return { kind: "powered_off" };
    case State.Unauthorized:
      return { kind: "unauthorized", platform: currentPlatform() };
    case State.Unsupported:
      return { kind: "unsupported" };
    case State.Resetting:
      return { kind: "resetting" };
    case State.Unknown:
      return { kind: "unknown" };
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
};

export const assertAndroidPermission = (
  result: AndroidBlePermissionResult,
): void => {
  switch (result.kind) {
    case "granted":
    case "not_applicable":
      return;
    case "denied":
    case "never_ask_again": {
      throw new BlePermissionDeniedError();
    }
    default: {
      const _exhaustive: never = result;
      return _exhaustive;
    }
  }
};
