export type ScanView =
  "permission" | "denied" | "reconnecting" | "scanning" | "found" | "empty";

export interface ScanViewInputs {
  promptSeen: boolean;
  denied: boolean;
  reconnecting: boolean;
  scanning: boolean;
  deviceCount: number;
}

type Rule = readonly [ScanView, (inputs: ScanViewInputs) => boolean];

const RULES: readonly Rule[] = [
  ["denied", (inputs) => inputs.denied],
  ["permission", (inputs) => !inputs.promptSeen],
  ["reconnecting", (inputs) => inputs.reconnecting],
  ["scanning", (inputs) => inputs.scanning && inputs.deviceCount === 0],
  ["found", (inputs) => inputs.deviceCount > 0],
];

export const scanView = (inputs: ScanViewInputs): ScanView =>
  RULES.find(([, applies]) => applies(inputs))?.[0] ?? "empty";
