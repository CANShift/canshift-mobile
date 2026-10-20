import { Buffer } from "buffer";
import { BleErrorCode } from "react-native-ble-plx";
import type { Device } from "react-native-ble-plx";
import { readDashPages } from "./ble-pages";
import { useDashPagesStore } from "../../stores/dash-pages.store";
import type { MonitorHost } from "./ble-monitors";

const host: MonitorHost = {
  isCurrent: () => true,
  hasConnection: () => true,
  runGatt: (op) => op(),
};

const deviceReading = (read: () => Promise<{ value: string | null }>) =>
  ({ readCharacteristicForService: read }) as unknown as Device;

const bleError = (errorCode: BleErrorCode): Error =>
  Object.assign(new Error("ble"), { errorCode });

const payload = (json: string) => ({
  value: Buffer.from(json).toString("base64"),
});

describe("readDashPages", () => {
  beforeEach(() => {
    useDashPagesStore.getState().reset();
  });

  it("stores the page ids the dash sends", async () => {
    const device = deviceReading(() =>
      Promise.resolve(payload('{"pages":["street","track"]}')),
    );
    await readDashPages(host, device);
    expect(useDashPagesStore.getState()).toMatchObject({
      listState: "ready",
      pageIds: ["street", "track"],
    });
  });

  it("marks the list unsupported on firmware without the characteristic", async () => {
    const missing = bleError(BleErrorCode.CharacteristicNotFound);
    await readDashPages(
      host,
      deviceReading(() => Promise.reject(missing)),
    );
    expect(useDashPagesStore.getState().listState).toBe("unsupported");
  });

  it("marks the list failed when the read fails or the payload is malformed", async () => {
    const failed = bleError(BleErrorCode.CharacteristicReadFailed);
    await readDashPages(
      host,
      deviceReading(() => Promise.reject(failed)),
    );
    expect(useDashPagesStore.getState().listState).toBe("failed");
    useDashPagesStore.getState().reset();
    const canary = deviceReading(() =>
      Promise.resolve(payload('{"err":"too_long"}')),
    );
    await readDashPages(host, canary);
    expect(useDashPagesStore.getState().listState).toBe("failed");
  });
});
