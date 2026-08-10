import { mapBleError } from "./ble.errors";

const isTransient = (err: unknown): boolean => {
  const { kind } = mapBleError(err);
  return kind === "write-failed" || kind === "not-in-range";
};

export const withGattRetry = async <T>(
  op: () => Promise<T>,
  {
    retries = 1,
    backoffMs = 500,
    maxBackoffMs = 4000,
  }: { retries?: number; backoffMs?: number; maxBackoffMs?: number } = {},
): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await op();
    } catch (err) {
      if (attempt >= retries || !isTransient(err)) throw err;
      const delay = Math.min(backoffMs * 2 ** attempt, maxBackoffMs);
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }
};
