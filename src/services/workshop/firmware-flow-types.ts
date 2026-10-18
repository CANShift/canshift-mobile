import type { DashWifi } from "./dash-wifi";
import type { OpenResult } from "./dash-socket";
import type { WorkshopNetwork } from "./workshop-network";

export type FirmwareStep = "upload" | "signature" | "restart" | "reconnect";

export type WifiProblem = "denied" | "invalid" | "failed";

export type FlowFailure =
  | { kind: "refused"; code: string; detail: string | null }
  | { kind: "dropped" }
  | { kind: "rolledBack"; running: string }
  | { kind: "notBack" };

export type FlowView =
  | { kind: "closed" }
  | { kind: "prepare" }
  | { kind: "wifi"; joining: boolean; problem: WifiProblem | null }
  | { kind: "connecting" }
  | { kind: "unreachable" }
  | { kind: "busy" }
  | { kind: "ready" }
  | { kind: "running"; step: FirmwareStep; sent: number; total: number }
  | { kind: "success"; version: string }
  | { kind: "failed"; failure: FlowFailure };

export interface BleHandoff {
  hold: () => void;
  resume: () => Promise<void>;
  waitForDash: (timeoutMs: number) => Promise<string | null>;
}

interface NetworkMemory {
  load: () => Promise<WorkshopNetwork>;
  save: (network: WorkshopNetwork) => Promise<void>;
}

export interface FirmwareFlowDeps {
  openSocket: () => Promise<OpenResult>;
  wifi: DashWifi;
  ble: BleHandoff;
  network: NetworkMemory;
  sleep: (ms: number) => Promise<void>;
  now: () => number;
}
