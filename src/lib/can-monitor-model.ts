import type { CanMonitorEntry, CanMonitorFrame } from "@canshift/core/wire";
import { formatCanId } from "./can-hex";

export const RATE_WINDOW_MS = 2000;
const MIN_RATE_SPAN_MS = 100;
const MS_PER_SECOND = 1000;

interface RateSample {
  atMs: number;
  count: number;
}

export interface CanRow {
  key: string;
  id: number;
  extended: boolean;
  idLabel: string;
  data: readonly number[];
  changed: readonly boolean[];
  firstMs: number;
  samples: readonly RateSample[];
  rateHz: number;
}

export interface CanMonitorSnapshot {
  rows: Readonly<Record<string, CanRow>>;
  deviceMs: number;
  overflow: boolean;
  filtered: boolean;
}

export const EMPTY_CAN_SNAPSHOT: CanMonitorSnapshot = {
  rows: {},
  deviceMs: 0,
  overflow: false,
  filtered: false,
};

const rowKey = (entry: CanMonitorEntry): string =>
  `${entry.extended ? "x" : "s"}:${String(entry.id)}`;

const changedBytes = (
  previous: readonly number[] | undefined,
  next: readonly number[],
): boolean[] => next.map((byte, index) => previous?.[index] !== byte);

const updatedRow = (
  previous: CanRow | undefined,
  entry: CanMonitorEntry,
  deviceMs: number,
): CanRow => {
  const atMs = deviceMs - entry.ageMs;
  return {
    key: rowKey(entry),
    id: entry.id,
    extended: entry.extended,
    idLabel: formatCanId(entry),
    data: entry.data,
    changed: changedBytes(previous?.data, entry.data),
    firstMs: previous?.firstMs ?? atMs,
    samples: [...(previous?.samples ?? []), { atMs, count: entry.count }],
    rateHz: previous?.rateHz ?? 0,
  };
};

const withRate = (row: CanRow, nowMs: number): CanRow => {
  const samples = row.samples.filter(
    (sample) => sample.atMs > nowMs - RATE_WINDOW_MS,
  );
  const span = Math.max(
    Math.min(RATE_WINDOW_MS, nowMs - row.firstMs),
    MIN_RATE_SPAN_MS,
  );
  const frames = samples.reduce((total, sample) => total + sample.count, 0);
  return { ...row, samples, rateHz: (frames * MS_PER_SECOND) / span };
};

export const applyCanFrame = (
  snapshot: CanMonitorSnapshot,
  frame: CanMonitorFrame,
): CanMonitorSnapshot => {
  const rows: Record<string, CanRow> = { ...snapshot.rows };
  for (const entry of frame.entries) {
    const key = rowKey(entry);
    rows[key] = updatedRow(rows[key], entry, frame.deviceMs);
  }
  for (const key of Object.keys(rows)) {
    const row = rows[key];
    if (row) rows[key] = withRate(row, frame.deviceMs);
  }
  return {
    rows,
    deviceMs: frame.deviceMs,
    overflow: frame.overflow,
    filtered: frame.filtered,
  };
};

const byId = (a: CanRow, b: CanRow): number =>
  Number(a.extended) - Number(b.extended) || a.id - b.id;

export const sortedCanRows = (snapshot: CanMonitorSnapshot): CanRow[] =>
  Object.values(snapshot.rows).sort(byId);

export const busRateHz = (rows: readonly CanRow[]): number =>
  rows.reduce((total, row) => total + row.rateHz, 0);
