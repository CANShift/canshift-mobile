import { useEffect, useMemo } from "react";
import { Toast } from "../components/ui";
import { errText } from "../lib/error-text";
import {
  LOGGING_CUTOFF_PERCENT,
  phoneBatteryStatus,
  toBatteryPercent,
} from "../lib/phone-battery";
import {
  expoBatteryWatcher,
  type PhoneBatteryWatcher,
} from "../services/phone-battery";
import { trackModeController } from "../services/track-mode-controller";
import { log } from "../stores/log.store";
import { setPhoneBatteryPercent } from "../stores/phone-battery.store";
import { useTrackSessionStore } from "../stores/track-session.store";

export interface PhoneBatteryToastParams {
  type: "info" | "error";
  text1: string;
  text2: string;
}

export interface PhoneBatteryGuardDeps {
  watcher?: PhoneBatteryWatcher;
  isLogging?: () => boolean;
  stopLogging?: () => Promise<void>;
  showToast?: (params: PhoneBatteryToastParams) => void;
}

interface ResolvedDeps {
  watcher: PhoneBatteryWatcher;
  isLogging: () => boolean;
  stopLogging: () => Promise<void>;
  showToast: (params: PhoneBatteryToastParams) => void;
}

const resolveDeps = (deps: PhoneBatteryGuardDeps): ResolvedDeps => ({
  watcher: deps.watcher ?? expoBatteryWatcher,
  isLogging:
    deps.isLogging ?? (() => useTrackSessionStore.getState().recording),
  stopLogging: deps.stopLogging ?? (() => trackModeController.stop()),
  showToast:
    deps.showToast ??
    ((params) => {
      Toast.show(params);
    }),
});

const DEFAULT_DEPS: PhoneBatteryGuardDeps = Object.freeze({});

export const applyPhoneBatteryLevel = async (
  fraction: number,
  deps: ResolvedDeps,
): Promise<void> => {
  const percent = toBatteryPercent(fraction);
  setPhoneBatteryPercent(percent);
  if (phoneBatteryStatus(percent) !== "cutoff") return;
  if (!deps.isLogging()) return;
  try {
    await deps.stopLogging();
  } catch (err) {
    deps.showToast({
      type: "error",
      text1: "Could not stop logging",
      text2: errText(err),
    });
    return;
  }
  deps.showToast({
    type: "info",
    text1: "Logging stopped",
    text2: `Phone battery below ${String(LOGGING_CUTOFF_PERCENT)} % — the recording is protected.`,
  });
};

export const readPhoneBatteryLevel = async (
  deps: ResolvedDeps,
): Promise<void> => {
  let fraction: number;
  try {
    fraction = await deps.watcher.read();
  } catch (err) {
    setPhoneBatteryPercent(null);
    log("warn", `Phone battery level unavailable — ${errText(err)}`);
    return;
  }
  await applyPhoneBatteryLevel(fraction, deps);
};

export const usePhoneBatteryGuard = (
  deps: PhoneBatteryGuardDeps = DEFAULT_DEPS,
): void => {
  const resolved = useMemo(() => resolveDeps(deps), [deps]);

  useEffect(() => {
    const unsubscribe = resolved.watcher.subscribe((fraction) => {
      void applyPhoneBatteryLevel(fraction, resolved);
    });
    void readPhoneBatteryLevel(resolved);
    return unsubscribe;
  }, [resolved]);
};
