import type { AlertSource } from "@canshift/core";
import type { AlertEntry } from "./alert-model";

export type StripKind = "acknowledged" | "muted";

export interface AlertStripItem {
  entry: AlertEntry;
  kind: StripKind;
}

export interface AlertViews {
  takeover: readonly AlertEntry[];
  strips: readonly AlertStripItem[];
}

export interface AlertViewInputs {
  active: readonly AlertEntry[];
  acknowledged: readonly AlertSource[];
  muted: readonly AlertSource[];
}

const newestFirst = (a: AlertEntry, b: AlertEntry): number =>
  a.activeSeconds - b.activeSeconds;

const stripKind = (
  entry: AlertEntry,
  { acknowledged, muted }: AlertViewInputs,
): StripKind | null => {
  if (muted.includes(entry.source)) return "muted";
  if (entry.dashAcknowledged || acknowledged.includes(entry.source))
    return "acknowledged";
  return null;
};

export const alertViews = (inputs: AlertViewInputs): AlertViews => {
  const sorted = [...inputs.active].sort(newestFirst);
  const strips: AlertStripItem[] = [];
  const takeover: AlertEntry[] = [];
  for (const entry of sorted) {
    const kind = stripKind(entry, inputs);
    if (kind === null) takeover.push(entry);
    else strips.push({ entry, kind });
  }
  return { takeover, strips };
};

export const clearedSources = (
  before: readonly AlertEntry[],
  after: readonly AlertEntry[],
): AlertEntry[] => {
  const still = new Set(after.map((entry) => entry.source));
  return before.filter((entry) => !still.has(entry.source));
};
