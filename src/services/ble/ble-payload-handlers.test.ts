import { Buffer } from "buffer";
import { encodeTelemetryFrame } from "@canshift/core";
import { handleTelemetry } from "./ble-payload-handlers";
import { useDeviceStore } from "../../stores/device.store";
import { useLogStore } from "../../stores/log.store";
import { useSignalsStore } from "../../stores/signals.store";
import { clearBuffer, getWriteIndex } from "../../stores/telemetry.store";

const FUTURE_VERSION = 9;

const toBase64 = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString("base64");

const futureFrame = (): string => {
  const bytes = encodeTelemetryFrame({ r: 3000 });
  bytes[0] = FUTURE_VERSION;
  return toBase64(bytes);
};

const initialDevice = useDeviceStore.getState();
const initialSignals = useSignalsStore.getState();

describe("handleTelemetry", () => {
  beforeEach(() => {
    useDeviceStore.setState(initialDevice, true);
    useSignalsStore.setState(initialSignals, true);
    useLogStore.getState().clear();
    clearBuffer();
  });

  it("ingests a frame the app can read", () => {
    handleTelemetry(toBase64(encodeTelemetryFrame({ r: 3000 })));
    expect(getWriteIndex()).toBe(1);
    expect(useDeviceStore.getState().linkProblem).toBeNull();
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
});
