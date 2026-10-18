import { BleErrorCode } from "react-native-ble-plx";

import { currentPlatform } from "../lib/platform";

export type BleConnectionError =
  | { kind: "permission-denied"; platform: "ios" | "android" }
  | { kind: "bluetooth-off" }
  | { kind: "not-paired" }
  | { kind: "not-in-range" }
  | { kind: "disconnected" }
  | { kind: "characteristic-missing"; uuid?: string }
  | { kind: "write-failed"; reason?: string }
  | { kind: "telemetry-version"; version: number }
  | { kind: "telemetry-malformed" }
  | { kind: "unknown"; message: string };

export class BlePermissionDeniedError extends Error {
  constructor() {
    super("android_ble_permission_denied");
    this.name = "BlePermissionDeniedError";
  }
}

const hasErrorCode = (err: unknown): err is { errorCode: BleErrorCode } => {
  if (err === null || typeof err !== "object") return false;
  const code = (err as { errorCode?: unknown }).errorCode;
  return typeof code === "number";
};

const describe = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown BLE error";
};

const writeFailureReason = (err: unknown): string | undefined => {
  if (err instanceof Error && err.message.length > 0) return err.message;
  if (
    err !== null &&
    typeof err === "object" &&
    "reason" in err &&
    typeof (err as { reason?: unknown }).reason === "string"
  ) {
    return (err as { reason: string }).reason;
  }
  return undefined;
};

type ErrorMapper = (err: unknown) => BleConnectionError;

const fixed =
  (error: BleConnectionError): ErrorMapper =>
  () => ({ ...error });

const writeFailed: ErrorMapper = (err) => {
  const reason = writeFailureReason(err);
  return reason !== undefined
    ? { kind: "write-failed", reason }
    : { kind: "write-failed" };
};

const unknownError: ErrorMapper = (err) => ({
  kind: "unknown",
  message: describe(err),
});

const MAPPER_BY_CODE: Partial<Record<BleErrorCode, ErrorMapper>> = {
  [BleErrorCode.BluetoothUnauthorized]: () => ({
    kind: "permission-denied",
    platform: currentPlatform(),
  }),
  [BleErrorCode.BluetoothPoweredOff]: fixed({ kind: "bluetooth-off" }),
  [BleErrorCode.DeviceNotFound]: fixed({ kind: "not-paired" }),
  [BleErrorCode.DeviceConnectionFailed]: fixed({ kind: "not-in-range" }),
  [BleErrorCode.OperationTimedOut]: fixed({ kind: "not-in-range" }),
  [BleErrorCode.DeviceDisconnected]: fixed({ kind: "disconnected" }),
  [BleErrorCode.DeviceNotConnected]: fixed({ kind: "disconnected" }),
  [BleErrorCode.CharacteristicNotFound]: fixed({
    kind: "characteristic-missing",
  }),
  [BleErrorCode.ServiceNotFound]: fixed({ kind: "characteristic-missing" }),
  [BleErrorCode.CharacteristicsNotDiscovered]: fixed({
    kind: "characteristic-missing",
  }),
  [BleErrorCode.ServicesNotDiscovered]: fixed({
    kind: "characteristic-missing",
  }),
  [BleErrorCode.CharacteristicWriteFailed]: writeFailed,
  [BleErrorCode.CharacteristicReadFailed]: writeFailed,
};

export const mapBleError = (err: unknown): BleConnectionError => {
  if (err instanceof BlePermissionDeniedError) {
    return { kind: "permission-denied", platform: "android" };
  }
  if (!hasErrorCode(err)) return unknownError(err);
  return (MAPPER_BY_CODE[err.errorCode] ?? unknownError)(err);
};

export type BleErrorKind = BleConnectionError["kind"];

type BleErrorByKind = { [E in BleConnectionError as E["kind"]]: E };

export type BleErrorTable<R> = {
  [K in BleErrorKind]: (err: BleErrorByKind[K]) => R;
};

export const dispatchBleError = <R, K extends BleErrorKind>(
  table: BleErrorTable<R>,
  err: BleErrorByKind[K] & { kind: K },
): R => table[err.kind](err);

const DESCRIPTION_BY_KIND: BleErrorTable<string> = {
  "permission-denied": (err) => `permission denied (${err.platform})`,
  "bluetooth-off": () => "bluetooth off",
  "not-paired": () => "device not paired or not found",
  "not-in-range": () => "device not in range",
  disconnected: () => "device disconnected",
  "characteristic-missing": (err) =>
    err.uuid
      ? `characteristic missing (${err.uuid})`
      : "characteristic missing",
  "write-failed": (err) =>
    err.reason ? `write failed: ${err.reason}` : "write failed",
  "telemetry-version": (err) =>
    `telemetry frame version ${String(err.version)} not supported`,
  "telemetry-malformed": () => "telemetry frames unreadable",
  unknown: (err) => err.message,
};

export const describeBleError = (err: BleConnectionError): string =>
  dispatchBleError(DESCRIPTION_BY_KIND, err);
