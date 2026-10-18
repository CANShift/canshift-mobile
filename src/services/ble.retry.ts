import { mapBleError } from "./ble.errors";

interface RetryPolicy {
  retries: number;
  backoffMs: number;
  maxBackoffMs: number;
}

type Attempt<T> = { ok: true; value: T } | { ok: false; error: unknown };

const isTransient = (err: unknown): boolean => {
  const { kind } = mapBleError(err);
  return kind === "write-failed" || kind === "not-in-range";
};

const sleep = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const settle = async <T>(op: () => Promise<T>): Promise<Attempt<T>> => {
  try {
    return { ok: true, value: await op() };
  } catch (error) {
    return { ok: false, error };
  }
};

export const withGattRetry = async <T>(
  op: () => Promise<T>,
  {
    retries = 1,
    backoffMs = 500,
    maxBackoffMs = 4000,
  }: Partial<RetryPolicy> = {},
): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    const outcome = await settle(op);
    if (outcome.ok) return outcome.value;
    if (attempt >= retries || !isTransient(outcome.error)) throw outcome.error;
    await sleep(Math.min(backoffMs * 2 ** attempt, maxBackoffMs));
  }
};
