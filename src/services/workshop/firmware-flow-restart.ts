import { log } from "../../stores/log.store";
import { sameVersion } from "../../lib/firmware-version";
import { CMD_REBOOT } from "./workshop-wire";
import type { DashSocket } from "./dash-socket";
import type { FirmwareFlowDeps, FlowView } from "./firmware-flow-types";

export const CONNECT_ATTEMPTS = 4;
export const CONNECT_RETRY_MS = 2_000;
const RESTART_TIMEOUT_MS = 150_000;
const RESTART_RETRY_MS = 3_000;
export const BLE_RETURN_TIMEOUT_MS = 120_000;

export const reopenAfterRestart = async (
  deps: FirmwareFlowDeps,
): Promise<DashSocket | null> => {
  const deadline = deps.now() + RESTART_TIMEOUT_MS;
  while (deps.now() < deadline) {
    await deps.sleep(RESTART_RETRY_MS);
    const opened = await deps.openSocket();
    if (opened.kind === "open") return opened.socket;
  }
  return null;
};

export const leaveWorkshop = async (socket: DashSocket): Promise<void> => {
  const ack = await socket.send(CMD_REBOOT);
  if (!ack.ok) log("warn", `Leave workshop mode: no reply (${ack.code})`);
  socket.close();
};

export const viewAfterReturn = (
  running: string | null,
  target: string,
): FlowView => {
  if (running === null) return { kind: "failed", failure: { kind: "notBack" } };
  if (sameVersion(running, target))
    return { kind: "success", version: running };
  return { kind: "failed", failure: { kind: "rolledBack", running } };
};
