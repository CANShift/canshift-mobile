import type { Device, Subscription } from "react-native-ble-plx";
import { encodeCanMonitorFrame } from "@canshift/core/wire";
import { CanMonitorFeed } from "./ble-can-monitor";
import type { MonitorHost } from "./ble-monitors";
import { BLE_CHAR_CAN_MONITOR } from "../../constants/ble";
import { useCanMonitorStore } from "../../stores/can-monitor.store";
import { sortedCanRows } from "../../lib/can-monitor-model";
import { encodeBytesBase64, encodeBase64 } from "../base64";

type Listener = (error: Error | null, char: { value: string } | null) => void;

interface FakeDevice {
  device: Device;
  emit: (value: string) => void;
  fail: () => void;
  removed: jest.Mock;
  monitored: () => string[];
}

const fakeDevice = (): FakeDevice => {
  let listener: Listener | null = null;
  const removed = jest.fn();
  const characteristics: string[] = [];
  const device = {
    monitorCharacteristicForService: (
      _service: string,
      characteristic: string,
      next: Listener,
    ): Subscription => {
      characteristics.push(characteristic);
      listener = next;
      return { remove: removed };
    },
  } as unknown as Device;
  return {
    device,
    emit: (value) => listener?.(null, { value }),
    fail: () => listener?.(new Error("not found"), null),
    removed,
    monitored: () => characteristics,
  };
};

const hostFor = (fake: FakeDevice): MonitorHost => ({
  isCurrent: (device) => device === fake.device,
  hasConnection: () => true,
  runGatt: (op) => op(),
});

const FRAME_BYTES = encodeCanMonitorFrame({
  deviceMs: 100,
  overflow: false,
  filtered: false,
  entries: [{ id: 0x3e0, extended: false, data: [1], count: 1, ageMs: 0 }],
});

describe("CanMonitorFeed", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useCanMonitorStore.getState().reset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does nothing without a connected dash", () => {
    const fake = fakeDevice();
    const feed = new CanMonitorFeed(hostFor(fake), () => null);
    expect(feed.start()).toBe(false);
    expect(fake.monitored()).toEqual([]);
  });

  it("subscribes to CANMON and feeds decoded frames into the store", () => {
    const fake = fakeDevice();
    const feed = new CanMonitorFeed(hostFor(fake), () => fake.device);
    expect(feed.start()).toBe(true);
    expect(fake.monitored()).toEqual([BLE_CHAR_CAN_MONITOR]);
    fake.emit(encodeBytesBase64(FRAME_BYTES ?? new Uint8Array()));
    const rows = sortedCanRows(useCanMonitorStore.getState().snapshot);
    expect(rows.map((row) => row.idLabel)).toEqual(["3E0"]);
    expect(useCanMonitorStore.getState().feed).toBe("listening");
  });

  it("ignores a frame it cannot decode", () => {
    const fake = fakeDevice();
    new CanMonitorFeed(hostFor(fake), () => fake.device).start();
    fake.emit(encodeBase64("{}"));
    expect(useCanMonitorStore.getState().snapshot.rows).toEqual({});
  });

  it("unsubscribes on stop so the dash turns the monitor off", () => {
    const fake = fakeDevice();
    const feed = new CanMonitorFeed(hostFor(fake), () => fake.device);
    feed.start();
    feed.stop();
    expect(fake.removed).toHaveBeenCalledTimes(1);
  });

  it("reports a dash without the CAN monitor once retries run out", () => {
    const fake = fakeDevice();
    new CanMonitorFeed(hostFor(fake), () => fake.device).start();
    for (let attempt = 0; attempt < 3; attempt++) {
      fake.fail();
      jest.runOnlyPendingTimers();
    }
    expect(useCanMonitorStore.getState().feed).toBe("unavailable");
  });
});
