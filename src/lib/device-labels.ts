const EM_DASH = "—";
const NOT_CONNECTED = "Not connected";
const CONNECTING = "CONNECTING";

export type DeviceRowState = "connecting" | "signal" | "unadvertised";

export interface DeviceRowStatus {
  state: DeviceRowState;
  detail: string | null;
}

export const deviceRowStatus = (
  rssi: number | null,
  connecting: boolean,
): DeviceRowStatus => {
  if (connecting) return { state: "connecting", detail: CONNECTING };
  if (rssi === null) return { state: "unadvertised", detail: null };
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
