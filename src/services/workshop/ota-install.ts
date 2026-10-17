import { encodeBytesBase64 } from "../base64";
import {
  CMD_OTA_BEGIN,
  CMD_OTA_END,
  CMD_OTA_WRITE,
  COMMIT_TIMEOUT_MS,
  LINK_LOST_CODES,
  type Ack,
} from "./workshop-wire";

export const OTA_CHUNK_BYTES = 8_192;

export interface FirmwarePackage {
  bytes: Uint8Array;
  signature: Uint8Array;
  sha256: string;
  version: string;
}

export type InstallResult =
  | { kind: "installed" }
  | { kind: "unconfirmed" }
  | { kind: "cancelled" }
  | { kind: "dropped" }
  | { kind: "refused"; code: string; detail: string | null };

export interface OtaLink {
  send: (
    cmd: number,
    fields?: Record<string, unknown>,
    timeoutMs?: number,
  ) => Promise<Ack>;
}

export interface InstallHooks {
  onProgress: (sent: number, total: number) => void;
  onCommitting: () => void;
  isCancelled: () => boolean;
}

type Failed = Extract<Ack, { ok: false }>;

const CANCELLED: Failed = { ok: false, code: "cancelled" };

const failure = (ack: Failed): InstallResult => {
  if (ack.code === CANCELLED.code) return { kind: "cancelled" };
  if (LINK_LOST_CODES.has(ack.code)) return { kind: "dropped" };
  return { kind: "refused", code: ack.code, detail: ack.detail ?? null };
};

const begin = (link: OtaLink, pkg: FirmwarePackage): Promise<Ack> =>
  link.send(CMD_OTA_BEGIN, {
    total: pkg.bytes.byteLength,
    sha256: pkg.sha256,
    sig: encodeBytesBase64(pkg.signature),
    version: pkg.version,
  });

const sendChunks = async (
  link: OtaLink,
  bytes: Uint8Array,
  hooks: InstallHooks,
): Promise<Failed | null> => {
  for (let offset = 0; offset < bytes.byteLength; offset += OTA_CHUNK_BYTES) {
    if (hooks.isCancelled()) return CANCELLED;
    const chunk = bytes.subarray(offset, offset + OTA_CHUNK_BYTES);
    const ack = await link.send(CMD_OTA_WRITE, {
      offset,
      data: encodeBytesBase64(chunk),
    });
    if (!ack.ok) return ack;
    hooks.onProgress(offset + chunk.byteLength, bytes.byteLength);
  }
  return null;
};

const commit = async (link: OtaLink): Promise<InstallResult> => {
  const ack = await link.send(
    CMD_OTA_END,
    { action: "commit" },
    COMMIT_TIMEOUT_MS,
  );
  if (ack.ok) return { kind: "installed" };
  return LINK_LOST_CODES.has(ack.code) ? { kind: "unconfirmed" } : failure(ack);
};

export const installFirmware = async (
  link: OtaLink,
  pkg: FirmwarePackage,
  hooks: InstallHooks,
): Promise<InstallResult> => {
  const opened = await begin(link, pkg);
  if (!opened.ok) return failure(opened);
  const rejected = await sendChunks(link, pkg.bytes, hooks);
  if (rejected !== null) {
    await link.send(CMD_OTA_END, { action: "abort" });
    return failure(rejected);
  }
  hooks.onCommitting();
  return commit(link);
};
