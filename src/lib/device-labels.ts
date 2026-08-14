const EM_DASH = "—";
const NOT_CONNECTED = "Not connected";
const CONNECTING = "CONNECTING";
const UNKNOWN_RSSI = "- - dBm";

export type DeviceRowState = "connecting" | "signal" | "unknown";

export interface DeviceRowStatus {
  state: DeviceRowState;
  detail: string;
}

export const deviceRowStatus = (
  rssi: number | null,
  connecting: boolean,
): DeviceRowStatus => {
  if (connecting) return { state: "connecting", detail: CONNECTING };
  if (rssi === null) return { state: "unknown", detail: UNKNOWN_RSSI };
  return { state: "signal", detail: `${String(rssi)} dBm` };
};

export const firmwareLabel = (
  isSim: boolean,
  connected: boolean,
  firmwareVersion: string | null,
): string => {
  if (isSim) return "Simulator";
  if (!connected) return NOT_CONNECTED;
  if (firmwareVersion === null) return EM_DASH;
  return `v${firmwareVersion}`;
};
