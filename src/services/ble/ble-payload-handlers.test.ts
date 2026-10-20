import { Buffer } from "buffer";
import { encodeTelemetryFrame } from "@canshift/core/wire";
import { handleStatus, handleTelemetry } from "./ble-payload-handlers";
import { useDashPagesStore } from "../../stores/dash-pages.store";
import { useDeviceStore } from "../../stores/device.store";
import { useLogStore } from "../../stores/log.store";
import { DISPLAY_FLUSH_MS, useSignalsStore } from "../../stores/signals.store";
import { clearBuffer, getWriteIndex } from "../../stores/telemetry.store";

const FUTURE_VERSION = 9;

const toBase64 = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString("base64");

const futureFrame = (): string => {
  const bytes = encodeTelemetryFrame({ r: 3000 });
  bytes[0] = FUTURE_VERSION;
  return toBase64(bytes);
};

const truncatedFrame = (): string =>
  toBase64(encodeTelemetryFrame({ r: 3000, op: 4 }).slice(0, -1));

const readableFrame = (): string => toBase64(encodeTelemetryFrame({ r: 3000 }));

const sendTruncated = (count: number): void => {
  for (let i = 0; i < count; i++) handleTelemetry(truncatedFrame());
};

const initialDevice = useDeviceStore.getState();
const initialSignals = useSignalsStore.getState();

describe("handleTelemetry", () => {
  beforeEach(() => {
    useDeviceStore.setState(initialDevice, true);
    useSignalsStore.setState(initialSignals, true);
    useSignalsStore.getState().clearHeld();
    useLogStore.getState().clear();
    clearBuffer();
  });

  it("ingests a frame the app can read", () => {
    handleTelemetry(toBase64(encodeTelemetryFrame({ r: 3000 })));
    expect(getWriteIndex()).toBe(1);
    expect(useDeviceStore.getState().linkProblem).toBeNull();
  });

  it("drops a signal the dash stops sending instead of holding its last value", () => {
    jest.useFakeTimers();
    handleTelemetry(toBase64(encodeTelemetryFrame({ r: 3000, op: 0.4 })));
    jest.advanceTimersByTime(DISPLAY_FLUSH_MS);
    handleTelemetry(toBase64(encodeTelemetryFrame({ r: 3000 })));
    jest.advanceTimersByTime(DISPLAY_FLUSH_MS);
    jest.useRealTimers();
    expect(useSignalsStore.getState().values).toEqual({ r: 3000 });
  });

  it("reports a frame version mismatch once, as one device problem", () => {
    for (let i = 0; i < 10; i++) handleTelemetry(futureFrame());
    expect(useDeviceStore.getState().linkProblem).toEqual({
      kind: "telemetry-version",
      version: FUTURE_VERSION,
    });
    expect(useLogStore.getState().entries).toHaveLength(1);
    expect(getWriteIndex()).toBe(0);
  });

  it("forgets the mismatch when the dash disconnects", () => {
    handleTelemetry(futureFrame());
    useDeviceStore.getState().disconnect();
    expect(useDeviceStore.getState().linkProblem).toBeNull();
  });

  it("raises one device problem after a run of unreadable frames, not a log line per frame", () => {
    sendTruncated(9);
    expect(useDeviceStore.getState().linkProblem).toBeNull();
    sendTruncated(21);
    expect(useDeviceStore.getState().linkProblem).toEqual({
      kind: "telemetry-malformed",
    });
    expect(useLogStore.getState().entries).toHaveLength(1);
    expect(getWriteIndex()).toBe(0);
  });

  it("clears the problem and starts counting again once a frame reads", () => {
    sendTruncated(10);
    handleTelemetry(readableFrame());
    expect(useDeviceStore.getState().linkProblem).toBeNull();
    sendTruncated(9);
    expect(useDeviceStore.getState().linkProblem).toBeNull();
  });

  it("starts counting from zero on the next connection", () => {
    sendTruncated(10);
    useDeviceStore.getState().disconnect();
    sendTruncated(9);
    expect(useDeviceStore.getState().linkProblem).toBeNull();
    sendTruncated(1);
    expect(useDeviceStore.getState().linkProblem).toEqual({
      kind: "telemetry-malformed",
    });
  });

  it("keeps a version mismatch as the problem shown", () => {
    handleTelemetry(futureFrame());
    sendTruncated(10);
    expect(useDeviceStore.getState().linkProblem).toEqual({
      kind: "telemetry-version",
      version: FUTURE_VERSION,
    });
  });
});

describe("handleStatus", () => {
  beforeEach(() => {
    useDashPagesStore.getState().reset();
  });

  const status = (json: string): string => Buffer.from(json).toString("base64");

  it("follows the page the dash reports on screen", () => {
    handleStatus(status('{"ver":"0.22.0","can":1,"page":"track"}'));
    expect(useDashPagesStore.getState().onScreenId).toBe("track");
    handleStatus(status('{"ver":"0.22.0","can":1,"page":""}'));
    expect(useDashPagesStore.getState().onScreenId).toBeNull();
  });

  it("leaves the page alone on firmware that doesn't report it", () => {
    useDashPagesStore.getState().setOnScreen("street");
    handleStatus(status('{"ver":"0.21.0","can":1}'));
    expect(useDashPagesStore.getState().onScreenId).toBe("street");
  });
});
