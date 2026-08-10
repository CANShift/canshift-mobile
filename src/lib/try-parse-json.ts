export type JsonParseResult<T> = { ok: true; value: T } | { ok: false };

export const tryParseJson = <T = unknown>(raw: string): JsonParseResult<T> => {
  try {
    return { ok: true, value: JSON.parse(raw) as T };
  } catch {
    return { ok: false };
  }
};
