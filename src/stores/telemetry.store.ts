import type { SignalKey } from "../constants/ble";

const MAX_BUFFER_SIZE = 6000;
const DEFAULT_BUFFER_CAP = 3000;

export type SignalValues = Partial<Record<SignalKey, number>>;

export interface TelemetrySample {
  t: number;
  v: SignalValues;
}

const buffer: (TelemetrySample | undefined)[] = new Array<
  TelemetrySample | undefined
>(MAX_BUFFER_SIZE);
let head = 0;
let size = 0;
let writeIndex = 0;
let cap = DEFAULT_BUFFER_CAP;

export const setBufferCap = (samples: number): void => {
  cap = Math.max(1, Math.min(samples, MAX_BUFFER_SIZE));
};

export const getBufferCap = (): number => cap;

const availableCount = (): number => Math.min(size, cap);

export const pushSample = (values: SignalValues): void => {
  buffer[head] = { t: Date.now(), v: { ...values } };
  head = (head + 1) % MAX_BUFFER_SIZE;
  if (size < MAX_BUFFER_SIZE) size++;
  writeIndex++;
};

export const getWriteIndex = (): number => {
  return writeIndex;
};

export const getRange = (
  fromIndex: number,
  toIndex: number,
): readonly TelemetrySample[] => {
  if (toIndex <= fromIndex || size === 0) return [];
  const oldestAvailable = writeIndex - availableCount();
  const from = Math.max(fromIndex, oldestAvailable);
  const to = Math.min(toIndex, writeIndex);
  if (to <= from) return [];
  const count = to - from;
  const out: TelemetrySample[] = new Array<TelemetrySample>(count);
  for (let i = 0; i < count; i++) {
    const monotonic = from + i;
    const offsetFromHead = writeIndex - monotonic;
    const ringIdx = (head - offsetFromHead + MAX_BUFFER_SIZE) % MAX_BUFFER_SIZE;
    const sample = buffer[ringIdx];
    if (sample !== undefined) out[i] = sample;
  }
  return out;
};

export const clearBuffer = (): void => {
  for (let i = 0; i < MAX_BUFFER_SIZE; i++) buffer[i] = undefined;
  head = 0;
  size = 0;
  writeIndex = 0;
};
