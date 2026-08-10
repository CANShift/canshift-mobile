import { useDeviceStore } from "../stores/device.store";
import { describeBleError, mapBleError } from "./ble.errors";
import { useReconnectStore } from "../stores/reconnect.store";
import { log } from "../stores/log.store";
import { errText } from "../lib/error-text";

const RECONNECT_INITIAL_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 30_000;
const RECONNECT_BACKOFF_FACTOR = 2;
const RECONNECT_JITTER_RATIO = 0.2;
const RECONNECT_MAX_ATTEMPTS = 6;
const RECONNECT_SCAN_TIMEOUT_MS = 5_000;

export const computeBackoffDelay = (attempt: number): number => {
  const exponential =
    RECONNECT_INITIAL_DELAY_MS * Math.pow(RECONNECT_BACKOFF_FACTOR, attempt);
  const capped = Math.min(exponential, RECONNECT_MAX_DELAY_MS);
  const jitter = capped * RECONNECT_JITTER_RATIO * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(capped + jitter));
};

const isAborted = (signal: AbortSignal): boolean => {
  return signal.aborted;
};

export const sleepWithAbort = (
  ms: number,
  signal: AbortSignal,
): Promise<void> => {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const handle = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(handle);
      signal.removeEventListener("abort", onAbort);
      resolve();
    };
    signal.addEventListener("abort", onAbort);
  });
};

type AttemptStep = "retry" | "stop";

interface ScanOutcome {
  found: boolean;
  error?: unknown;
}

export interface BleReconnectDeps {
  connect: (deviceId: string) => Promise<void>;
  startScan: (
    onResult: (error: unknown, deviceId: string | null) => void,
  ) => void;
  stopScan: () => void;
}

export class BleReconnector {
  private controller: AbortController | null = null;

  constructor(private readonly deps: BleReconnectDeps) {}

  cancel(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
    this.deps.stopScan();
    useReconnectStore.getState().stop();
  }

  private async tryConnectAttempt(
    deviceId: string,
    attempt: number,
    signal: AbortSignal,
  ): Promise<"aborted" | "connected" | "failed"> {
    try {
      await this.deps.connect(deviceId);
      if (isAborted(signal)) return "aborted";
      log("info", `Auto-reconnect: succeeded on attempt ${String(attempt)}`);
      return "connected";
    } catch (err) {
      if (isAborted(signal)) return "aborted";
      const msg = errText(err);
      log(
        "warn",
        `Auto-reconnect: connect failed on attempt ${String(attempt)}: ${msg}`,
      );
      return "failed";
    }
  }

  async run(deviceId: string): Promise<void> {
    if (this.controller) {
      log(
        "warn",
        "Reconnect loop already running — ignoring duplicate trigger",
      );
      return;
    }

    const controller = new AbortController();
    this.controller = controller;
    const { signal } = controller;
    const reconnectStore = useReconnectStore.getState();
    reconnectStore.start(deviceId, RECONNECT_MAX_ATTEMPTS);

    log("info", `Auto-reconnect: starting for ${deviceId}`);

    try {
      for (let attempt = 1; attempt <= RECONNECT_MAX_ATTEMPTS; attempt++) {
        if (isAborted(signal)) return;
        const step = await this.runAttempt(deviceId, attempt, signal);
        if (step !== "retry") return;
      }

      if (!isAborted(signal)) {
        log("error", "Auto-reconnect: max attempts reached, giving up");
        useDeviceStore.getState().setError({ kind: "not-in-range" });
      }
    } finally {
      if (this.controller === controller) {
        this.controller = null;
      }
      useReconnectStore.getState().stop();
    }
  }

  private async runAttempt(
    deviceId: string,
    attempt: number,
    signal: AbortSignal,
  ): Promise<AttemptStep> {
    const delay = computeBackoffDelay(attempt - 1);
    useReconnectStore.getState().setAttempt(attempt);
    log(
      "info",
      `Auto-reconnect: attempt ${String(attempt)}/${String(RECONNECT_MAX_ATTEMPTS)} in ${String(delay)}ms`,
    );
    await sleepWithAbort(delay, signal);
    if (isAborted(signal)) return "stop";

    const scan = await this.scanForDevice(deviceId, signal);
    if (isAborted(signal)) return "stop";
    if (scan.error !== undefined) {
      return this.reportScanFailure(attempt, scan.error);
    }
    if (!scan.found) {
      log(
        "warn",
        `Auto-reconnect: device ${deviceId} not seen on attempt ${String(attempt)}`,
      );
      return "retry";
    }

    const outcome = await this.tryConnectAttempt(deviceId, attempt, signal);
    return outcome === "failed" ? "retry" : "stop";
  }

  private reportScanFailure(attempt: number, error: unknown): AttemptStep {
    const mapped = mapBleError(error);
    if (
      mapped.kind === "bluetooth-off" ||
      mapped.kind === "permission-denied"
    ) {
      log("error", `Auto-reconnect: giving up — ${describeBleError(mapped)}`);
      useDeviceStore.getState().setError(mapped);
      return "stop";
    }
    log(
      "warn",
      `Auto-reconnect: scan failed on attempt ${String(attempt)} — ${describeBleError(mapped)}`,
    );
    return "retry";
  }

  private scanForDevice(
    deviceId: string,
    signal: AbortSignal,
  ): Promise<ScanOutcome> {
    return new Promise((resolve) => {
      if (signal.aborted) {
        resolve({ found: false });
        return;
      }

      let settled = false;
      const finish = (outcome: ScanOutcome) => {
        if (settled) return;
        settled = true;
        this.deps.stopScan();
        signal.removeEventListener("abort", onAbort);
        clearTimeout(timer);
        resolve(outcome);
      };
      const onAbort = () => {
        finish({ found: false });
      };
      signal.addEventListener("abort", onAbort);

      const timer = setTimeout(() => {
        finish({ found: false });
      }, RECONNECT_SCAN_TIMEOUT_MS);

      this.deps.startScan((error, foundDeviceId) => {
        if (error) {
          finish({ found: false, error });
          return;
        }
        if (foundDeviceId === deviceId) {
          finish({ found: true });
        }
      });
    });
  }
}
