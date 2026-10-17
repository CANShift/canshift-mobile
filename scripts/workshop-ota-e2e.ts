import { createHash, createPrivateKey, sign } from "node:crypto";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DashSocket,
  type OpenResult,
} from "../src/services/workshop/dash-socket";
import { connectWebSocket } from "../src/services/workshop/socket-transport";
import {
  installFirmware,
  type FirmwarePackage,
} from "../src/services/workshop/ota-install";
import { CMD_REBOOT } from "../src/services/workshop/workshop-wire";
import { buildAppImage } from "../src/testing/app-image";

const URL = process.env.MOCK_DASH_URL ?? "ws://localhost:8787/ws";
const KEY_PATH = join(tmpdir(), "canshift-mock-dash-signing.pem");
const TARGET_VERSION = "0.99.0";
const IMAGE_BYTES = 300_000;
const REBOOT_WAIT_MS = 1_000;
const REOPEN_ATTEMPTS = 10;

const open = (): Promise<OpenResult> =>
  DashSocket.open({ url: URL, connect: connectWebSocket });

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const check = (label: string, ok: boolean, detail: unknown): void => {
  console.log(
    `${ok ? "ok  " : "FAIL"} ${label}${ok ? "" : ` — ${JSON.stringify(detail)}`}`,
  );
  if (!ok) process.exitCode = 1;
};

const signedPackage = (): FirmwarePackage => {
  const bytes = buildAppImage(TARGET_VERSION, IMAGE_BYTES);
  const key = createPrivateKey(readFileSync(KEY_PATH));
  return {
    bytes,
    signature: new Uint8Array(sign(null, bytes, key)),
    sha256: createHash("sha256").update(bytes).digest("hex"),
    version: TARGET_VERSION,
  };
};

const requireOpen = async (label: string): Promise<DashSocket> => {
  const opened = await open();
  check(label, opened.kind === "open", opened.kind);
  if (opened.kind !== "open") throw new Error(`${label}: ${opened.kind}`);
  console.log(
    `     dash runs ${opened.dash.firmwareVersion} on ${opened.dash.boardId ?? "?"}`,
  );
  return opened.socket;
};

const reopenAfterReboot = async (): Promise<OpenResult> => {
  for (let attempt = 0; attempt < REOPEN_ATTEMPTS; attempt++) {
    await wait(REBOOT_WAIT_MS);
    const opened = await open();
    if (opened.kind === "open") return opened;
  }
  return { kind: "unreachable" };
};

const hooks = {
  onProgress: () => undefined,
  onCommitting: () => undefined,
  isCancelled: () => false,
};

const run = async (): Promise<void> => {
  const pkg = signedPackage();
  const socket = await requireOpen(
    "the mobile client opens the workshop socket",
  );
  const second = await open();
  check(
    "a second client is refused as busy (4001)",
    second.kind === "busy",
    second.kind,
  );
  const forged = await installFirmware(
    socket,
    { ...pkg, signature: new Uint8Array(64) },
    hooks,
  );
  check(
    "a forged signature is refused at commit",
    forged.kind === "refused" && forged.code === "ota_bad_signature",
    forged,
  );
  const installed = await installFirmware(socket, pkg, hooks);
  check(
    "a signed image streams and commits",
    installed.kind === "installed",
    installed,
  );
  socket.close();
  const back = await reopenAfterReboot();
  check(
    `the dash comes back running ${TARGET_VERSION}`,
    back.kind === "open" && back.dash.firmwareVersion === TARGET_VERSION,
    back.kind === "open" ? back.dash : back.kind,
  );
  if (back.kind !== "open") return;
  const left = await back.socket.send(CMD_REBOOT);
  check("leaving workshop mode is acknowledged", left.ok, left);
  back.socket.close();
};

run().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
