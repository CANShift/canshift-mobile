import {
  TELEMETRY_FRAME_VERSION,
  parseBleStatus,
  parseTimerLap,
  parseTimerState,
} from "@canshift/core/wire";
import { log } from "../../stores/log.store";
import { useSignalsStore } from "../../stores/signals.store";
import { useDeviceStore } from "../../stores/device.store";
import { useDashPagesStore } from "../../stores/dash-pages.store";
import { useTimerStore } from "../../stores/timer.store";
import { recordSessionLap } from "../../stores/timer-sessions.store";
import { parseTelemetry, type TelemetrySample } from "../ble.validators";
import { decodeBase64, decodeBase64ToBytes } from "../base64";
import { describeBleError } from "../ble.errors";

type Decoded<T> = { ok: true; value: T } | { ok: false; reason: string };

const guarded =
  <T>(
    label: string,
    decode: (raw: string) => Decoded<T>,
    apply: (value: T) => void,
  ) =>
  (raw: string): void => {
    const result = decode(raw);
    if (!result.ok) {
      log(
        "warn",
        `BLE: rejected malformed ${label} payload (${result.reason})`,
      );
      return;
    }
    apply(result.value);
  };

const decodeStatus = (raw: string) => {
  const result = parseBleStatus(decodeBase64(raw));
  return result.kind === "ok"
    ? ({ ok: true, value: result.status } as const)
    : ({ ok: false, reason: result.kind } as const);
};

const decodeTimerState = (raw: string) => {
  const result = parseTimerState(decodeBase64(raw));
  return result.kind === "ok"
    ? ({ ok: true, value: result.state } as const)
    : ({ ok: false, reason: result.kind } as const);
};

const decodeTimerLap = (raw: string) => {
  const result = parseTimerLap(decodeBase64(raw));
  return result.kind === "ok"
    ? ({ ok: true, value: result.lap } as const)
    : ({ ok: false, reason: result.kind } as const);
};

const applyStatus = (status: {
  firmwareVersion?: string;
  boardId?: string;
  canHealthy?: boolean;
  pageId?: string | null;
}): void => {
  const device = useDeviceStore.getState();
  device.setFirmwareStatus(
    status.firmwareVersion ?? "?",
    status.canHealthy ?? false,
  );
  if (status.boardId !== undefined) device.setBoardId(status.boardId);
  if (status.pageId !== undefined)
    useDashPagesStore.getState().setOnScreen(status.pageId);
};

const UNREADABLE_FRAMES_BEFORE_PROBLEM = 10;

const reportVersionMismatch = (version: number): void => {
  const store = useDeviceStore.getState();
  if (store.linkProblem?.kind === "telemetry-version") return;
  const problem = { kind: "telemetry-version", version } as const;
  store.setLinkProblem(problem);
  log("error", `BLE: ${describeBleError(problem)}`);
};

const reportMalformedTelemetry = (): void => {
  useDeviceStore.getState().countUnreadableFrame();
  const store = useDeviceStore.getState();
  if (store.unreadableFramesInARow < UNREADABLE_FRAMES_BEFORE_PROBLEM) return;
  if (store.linkProblem !== null) return;
  const problem = { kind: "telemetry-malformed" } as const;
  store.setLinkProblem(problem);
  log("error", `BLE: ${describeBleError(problem)}`);
};

const acceptTelemetry = (payload: TelemetrySample): void => {
  const store = useDeviceStore.getState();
  if (store.unreadableFramesInARow > 0) store.markTelemetryReadable();
  useSignalsStore.getState().ingest(payload);
};

export const handleTelemetry = (raw: string): void => {
  const bytes = decodeBase64ToBytes(raw);
  const version = bytes[0];
  if (version !== undefined && version !== TELEMETRY_FRAME_VERSION) {
    reportVersionMismatch(version);
    return;
  }
  const payload = parseTelemetry(bytes);
  if (payload === null) {
    reportMalformedTelemetry();
    return;
  }
  acceptTelemetry(payload);
};

export const handleStatus = guarded("status", decodeStatus, applyStatus);

export const handleTimerState = guarded(
  "timer state",
  decodeTimerState,
  (s) => {
    useTimerStore.getState().applyDeviceState(s);
  },
);

export const handleTimerLap = guarded("timer lap", decodeTimerLap, (lap) => {
  useTimerStore.getState().applyDeviceLap(lap);
  recordSessionLap(lap);
});

export const handleInitialStatus = guarded(
  "initial status",
  decodeStatus,
  applyStatus,
);

export const handleInitialTimerState = guarded(
  "initial timer state",
  decodeTimerState,
  (s) => {
    useTimerStore.getState().applyDeviceState(s);
  },
);
