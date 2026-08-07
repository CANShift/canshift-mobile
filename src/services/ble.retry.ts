const TRANSIENT_HINTS = ["GATT", "busy", "timed out", "cancelled"];

const isTransient = (err: unknown): boolean => {
  const msg = err instanceof Error ? err.message : String(err);
  return TRANSIENT_HINTS.some((hint) => msg.includes(hint));
};

export const withGattRetry = async <T>(
  op: () => Promise<T>,
  {
    retries = 1,
    backoffMs = 500,
    maxBackoffMs = 4000,
  }: { retries?: number; backoffMs?: number; maxBackoffMs?: number } = {},
): Promise<T> => {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await op();
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === retries) throw err;
      const delay = Math.min(backoffMs * 2 ** attempt, maxBackoffMs);
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastErr;
};
