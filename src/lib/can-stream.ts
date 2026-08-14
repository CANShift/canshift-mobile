import type { ConnectionState, DeviceMode } from "../stores/device.store";

type CanLinkState = "demo" | ConnectionState;

export const CAN_EMPTY_MESSAGE =
  "NO FRAMES YET.\nTHE DASH SENDS TELEMETRY,\nNOT THE RAW BUS.";

export const OPEN_LOG_LABEL = "OPEN THE LOG";

const LINK_LABEL: Record<CanLinkState, string> = {
  demo: "demo mode",
  idle: "offline",
  scanning: "searching",
  connecting: "connecting",
  connected: "connected",
  error: "failed",
};

export const canLinkFooter = (
  mode: DeviceMode,
  connection: ConnectionState,
): string => `Link: ${LINK_LABEL[mode === "sim" ? "demo" : connection]}`;
