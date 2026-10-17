import { STRINGS } from "../strings";
import type { FirmwareStep } from "../services/workshop/firmware-flow-types";

const F = STRINGS.firmware;
const FULL_PERCENT = 100;

export type StepState = "done" | "active" | "pending";

export interface StepRow {
  step: FirmwareStep;
  label: string;
  state: StepState;
}

const STEP_ORDER: readonly FirmwareStep[] = [
  "upload",
  "signature",
  "restart",
  "reconnect",
];

const LABELS: Record<FirmwareStep, Record<"active" | "done", string>> = {
  upload: { active: F.stepUpload, done: F.doneUpload },
  signature: { active: F.stepSignature, done: F.doneSignature },
  restart: { active: F.stepRestart, done: F.doneRestart },
  reconnect: { active: F.stepReconnect, done: F.doneReconnect },
};

const stateAt = (index: number, current: number): StepState => {
  if (index < current) return "done";
  return index === current ? "active" : "pending";
};

export const stepRows = (current: FirmwareStep): StepRow[] => {
  const at = STEP_ORDER.indexOf(current);
  return STEP_ORDER.map((step, index) => {
    const state = stateAt(index, at);
    const label = state === "done" ? LABELS[step].done : LABELS[step].active;
    return { step, label, state };
  });
};

export const uploadPercent = (sent: number, total: number): number =>
  total === 0 ? 0 : Math.floor((sent / total) * FULL_PERCENT);
