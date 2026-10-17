export const DASH_SOCKET_URL = "ws://192.168.4.1/ws";

export const CMD_QUERY_VERSION = 0x10;
export const CMD_OTA_BEGIN = 0x30;
export const CMD_OTA_WRITE = 0x31;
export const CMD_OTA_END = 0x32;
export const CMD_REBOOT = 0xf0;

export const CLOSE_BUSY = 4001;
export const KEEP_ALIVE_MS = 3_500;
export const OPEN_TIMEOUT_MS = 8_000;
export const ACK_TIMEOUT_MS = 8_000;
export const COMMIT_TIMEOUT_MS = 15_000;

export type Ack =
  | { ok: true; reply: Record<string, unknown>; line: string }
  | { ok: false; code: string; detail?: string };

export const LINK_LOST_CODES: ReadonlySet<string> = new Set([
  "busy",
  "connection_closed",
  "not_connected",
  "ack_timeout",
]);
