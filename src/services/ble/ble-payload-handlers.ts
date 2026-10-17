import {
  TELEMETRY_FRAME_VERSION,
  parseBleStatus,
  parseTimerLap,
  parseTimerState,
} from "@canshift/core";
import { log } from "../../stores/log.store";
import { useSignalsStore } from "../../stores/signals.store";
import { useDeviceStore } from "../../stores/device.store";
import { useTimerStore } from "../../stores/timer.store";
import { recordSessionLap } from "../../stores/timer-sessions.store";
import { parseTelemetry } from "../ble.validators";
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

const decodeTelemetry = (
  raw: string,
): Decoded<NonNullable<ReturnType<typeof parseTelemetry>>> => {
  const payload = parseTelemetry(decodeBase64ToBytes(raw));
  return payload
    ? { ok: true, value: payload }
    : { ok: false, reason: "invalid" };
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
}): void => {
  const device = useDeviceStore.getState();
  device.setFirmwareStatus(
    status.firmwareVersion ?? "?",
    status.canHealthy ?? false,
  );
  if (status.boardId !== undefined) device.setBoardId(status.boardId);
};

const applyTelemetry = guarded("telemetry", decodeTelemetry, (p) => {
  useSignalsStore.getState().ingest(p);
});

const reportVersionMismatch = (version: number): void => {
  const store = useDeviceStore.getState();
  if (store.linkProblem?.kind === "telemetry-version") return;
  const problem = { kind: "telemetry-version", version } as const;
  store.setLinkProblem(problem);
  log("error", `BLE: ${describeBleError(problem)}`);
};

export const handleTelemetry = (raw: string): void => {
  const bytes = decodeBase64ToBytes(raw);
  const version = bytes[0];
  if (version !== undefined && version !== TELEMETRY_FRAME_VERSION) {
    reportVersionMismatch(version);
    return;
  }
  applyTelemetry(raw);
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
