import { log } from "../stores/log.store";
import { errText } from "./error-text";

export interface PersistResult<T> {
  value: T;
  failed: boolean;
}

export const persist = async <T>(
  label: string,
  op: () => T | Promise<T>,
  fallback: T,
): Promise<PersistResult<T>> => {
  try {
    return { value: await op(), failed: false };
  } catch (err) {
    log("warn", `${label} failed: ${errText(err)}`);
    return { value: fallback, failed: true };
  }
};
