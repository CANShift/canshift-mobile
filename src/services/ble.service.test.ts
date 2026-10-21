jest.mock("react-native-ble-plx", () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    state: jest.fn(),
    destroy: jest.fn(),
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
  })),
  State: {
    PoweredOn: "PoweredOn",
    PoweredOff: "PoweredOff",
    Unauthorized: "Unauthorized",
    Unsupported: "Unsupported",
    Resetting: "Resetting",
    Unknown: "Unknown",
  },
  BleErrorCode: {
    BluetoothUnauthorized: 101,
    BluetoothPoweredOff: 102,
    DeviceConnectionFailed: 200,
    DeviceDisconnected: 201,
    DeviceNotFound: 204,
    DeviceNotConnected: 205,
    OperationTimedOut: 3,
    ServiceNotFound: 302,
    ServicesNotDiscovered: 303,
    CharacteristicWriteFailed: 401,
    CharacteristicReadFailed: 402,
    CharacteristicNotFound: 404,
    CharacteristicsNotDiscovered: 405,
  },
}));

jest.mock("./last-device", () => ({
  rememberDevice: jest.fn(() => Promise.resolve()),
  forgetDevice: jest.fn(() => Promise.resolve()),
  getLastDevice: jest.fn(() => Promise.resolve(null)),
}));

import {
  BleErrorCode,
  BleManager as MockBleManager,
} from "react-native-ble-plx";
import type { BleManager, Device } from "react-native-ble-plx";
import { BleService, isBleAvailable } from "./ble.service";
import { STRINGS } from "../strings";
import { BlePermissionDeniedError, mapBleError } from "./ble.errors";
import { forgetDevice } from "./last-device";
import { useDeviceStore } from "../stores/device.store";
import { useReconnectStore } from "../stores/reconnect.store";
import { muteAlerts, useAlertsStore } from "../stores/alerts.store";
import { useSignalsStore } from "../stores/signals.store";
import {
  BLE_CHAR_TELE,
  BLE_CHAR_STATUS,
  BLE_CHAR_TIMER_STATE,
  BLE_CHAR_TIMER_LAP,
} from "../constants/ble";

interface PendingOp {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

interface DeferredFactory {
  pending: PendingOp[];
  next: () => Promise<unknown>;
}

const makeDeferredFactory = (): DeferredFactory => {
  const pending: PendingOp[] = [];
  const next = () =>
    new Promise<unknown>((resolve, reject) => {
      pending.push({ resolve, reject });
    });
  return { pending, next };
};

const makeStubDevice = (factory: DeferredFactory): Device => {
  const stub = {
    id: "test-device",
    name: "CANShift-test",
    writeCharacteristicWithResponseForService: jest.fn(() => factory.next()),
    writeCharacteristicWithoutResponseForService: jest.fn(() => factory.next()),
    readCharacteristicForService: jest.fn(() => factory.next()),
  };
  return stub as unknown as Device;
};

const makeService = (showToast = jest.fn()): BleService => {
  const managerStub = {
    destroy: jest.fn(),
    stopDeviceScan: jest.fn(),
  } as unknown as BleManager;
  return new BleService({
    managerFactory: () => managerStub,
    requestAndroidPermissions: () =>
      Promise.resolve({ kind: "not_applicable" }),
    showToast,
  });
};

const flush = (): Promise<void> => {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
};

describe("BleService GATT serializer", () => {
  it("serializes concurrent writes — second op does not start until first settles", async () => {
    const factory = makeDeferredFactory();
    const service = makeService();
    service._test_setConnectedDevice(makeStubDevice(factory));

    const first = service.pushSettings({ brightness: 50 });
    const second = service.sendCmd("ping");

    await flush();

    expect(factory.pending).toHaveLength(1);

    factory.pending[0]?.resolve(undefined);
    await first;
    await flush();

    expect(factory.pending).toHaveLength(2);
    factory.pending[1]?.resolve(undefined);
    await second;
  });

  it("isolates failures — a rejected op does not prevent subsequent ops from running", async () => {
    const factory = makeDeferredFactory();
    const service = makeService();
    service._test_setConnectedDevice(makeStubDevice(factory));

    const first = service.sendCmd("boom");
    const second = service.sendCmd("next");

    await flush();
    expect(factory.pending).toHaveLength(1);

    const failure = new Error("write failed");
    factory.pending[0]?.reject(failure);
    await expect(first).rejects.toBe(failure);
    await flush();

    expect(factory.pending).toHaveLength(2);
    factory.pending[1]?.resolve(undefined);
    await expect(second).resolves.toBeUndefined();
  });
});

describe("BleService disconnect", () => {
  it("still clears state and forgets the device when cancelConnection rejects, and says so once", async () => {
    const showToast = jest.fn();
    const service = makeService(showToast);
    const device = {
      id: "test-device",
      cancelConnection: jest.fn(() => Promise.reject(new Error("gatt busy"))),
    } as unknown as Device;
    service._test_setConnectedDevice(device);

    await expect(service.disconnect()).resolves.toBeUndefined();

    expect(jest.mocked(forgetDevice)).toHaveBeenCalled();
    expect(useDeviceStore.getState().connectionState).toBe("idle");
    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith({
      type: "error",
      text1: STRINGS.device.disconnectFailed,
    });
  });
});

describe("BleService scan cancellation", () => {
  type ScanListener = (
    error: { message: string } | null,
    device: { id: string; name: string } | null,
  ) => void;

  const makeScanService = () => {
    const startDeviceScan = jest.fn<
      undefined,
      [string[], Record<string, unknown>, ScanListener]
    >();
    const stopDeviceScan = jest.fn();
    const managerStub = {
      destroy: jest.fn(),
      startDeviceScan,
      stopDeviceScan,
    } as unknown as BleManager;
    const service = new BleService({
      managerFactory: () => managerStub,
      requestAndroidPermissions: () =>
        Promise.resolve({ kind: "not_applicable" }),
    });
    return { service, startDeviceScan, stopDeviceScan };
  };

  it("stopScan settles an in-flight scan before the timeout", async () => {
    const { service, stopDeviceScan } = makeScanService();
    const scanPromise = service.scan(jest.fn(), 60_000);
    await flush();

    service.stopScan();

    await expect(scanPromise).resolves.toBeUndefined();
    expect(stopDeviceScan).toHaveBeenCalled();
  });

  it("ignores scan results delivered after stopScan settled the scan", async () => {
    const { service, startDeviceScan } = makeScanService();
    const onFound = jest.fn();
    const scanPromise = service.scan(onFound, 60_000);
    await flush();

    const listener = startDeviceScan.mock.calls[0]?.[2];
    expect(listener).toBeDefined();

    service.stopScan();
    await scanPromise;

    listener?.(null, { id: "dev-1", name: "CANShift-test" });
    expect(onFound).not.toHaveBeenCalled();
  });

  it("stopScan without an active scan still stops native scanning", () => {
    const { service, stopDeviceScan } = makeScanService();
    service.stopScan();
    expect(stopDeviceScan).toHaveBeenCalledTimes(1);
  });
});

describe("BleService connect", () => {
  beforeEach(() => {
    useAlertsStore.setState({ muted: [] });
  });

  it("aborts any in-flight reconnect loop before connecting", async () => {
    const managerStub = {
      destroy: jest.fn(),
      stopDeviceScan: jest.fn(),
      connectToDevice: jest.fn(() => Promise.reject(new Error("unreachable"))),
    } as unknown as BleManager;
    const service = new BleService({
      managerFactory: () => managerStub,
      requestAndroidPermissions: () =>
        Promise.resolve({ kind: "not_applicable" }),
    });
    const cancelSpy = jest.spyOn(service, "cancelReconnect");

    await expect(service.connect("dev-1")).rejects.toThrow("unreachable");

    expect(cancelSpy).toHaveBeenCalled();
  });

  it("starts a new alert session, so a mute from the last one is gone", async () => {
    const managerStub = {
      destroy: jest.fn(),
      stopDeviceScan: jest.fn(),
      connectToDevice: jest.fn(() => Promise.reject(new Error("unreachable"))),
    } as unknown as BleManager;
    const service = new BleService({
      managerFactory: () => managerStub,
      requestAndroidPermissions: () =>
        Promise.resolve({ kind: "not_applicable" }),
    });
    muteAlerts(["oil_pressure"]);

    await expect(service.connect("dev-1")).rejects.toThrow("unreachable");

    expect(useAlertsStore.getState().muted).toEqual([]);
  });
});

describe("BleService pending connect", () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ["setImmediate"] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const makeLinkableDevice = () => ({
    id: "dev-1",
    name: "CANShift-test",
    discoverAllServicesAndCharacteristics: jest.fn(() => Promise.resolve()),
    readCharacteristicForService: jest.fn(() =>
      Promise.resolve({ value: null }),
    ),
    monitorCharacteristicForService: jest.fn(() => ({ remove: jest.fn() })),
    onDisconnected: jest.fn(() => ({ remove: jest.fn() })),
    cancelConnection: jest.fn(() => Promise.resolve()),
  });

  const makePendingService = () => {
    const device = makeLinkableDevice();
    let open: (value: unknown) => void = () => undefined;
    const connectToDevice = jest.fn(
      (_id: string, _options: { timeout?: number }) =>
        new Promise((resolve) => {
          open = resolve;
        }),
    );
    const service = new BleService({
      managerFactory: () =>
        ({
          destroy: jest.fn(),
          stopDeviceScan: jest.fn(),
          connectToDevice,
        }) as unknown as BleManager,
      requestAndroidPermissions: () =>
        Promise.resolve({ kind: "not_applicable" }),
    });
    return {
      service,
      device,
      connectToDevice,
      open: () => {
        open(device);
      },
    };
  };

  it("bounds the connect attempt with a timeout", async () => {
    const { service, connectToDevice, open } = makePendingService();
    const connecting = service.connect("dev-1");
    await flush();
    open();
    await expect(connecting).resolves.toBe(true);
    expect(connectToDevice.mock.calls[0]?.[1].timeout).toBeGreaterThan(0);
  });

  it("drops a link that opens after the user cancelled", async () => {
    const { service, device, open } = makePendingService();
    const connecting = service.connect("dev-1");
    await flush();
    await service.disconnect();
    open();
    await expect(connecting).resolves.toBe(false);
    expect(device.cancelConnection).toHaveBeenCalled();
    expect(useDeviceStore.getState().connectionState).toBe("idle");
    expect(useDeviceStore.getState().deviceId).toBeNull();
  });
});

describe("BleService scan errors", () => {
  it("propagates the BleError verbatim so it can be classified, not a bare Error", async () => {
    const scan = {
      callback: null as ((error: unknown, device: unknown) => void) | null,
    };
    const managerStub = {
      destroy: jest.fn(),
      stopDeviceScan: jest.fn(),
      startDeviceScan: jest.fn((_uuids, _opts, cb) => {
        scan.callback = cb as (error: unknown, device: unknown) => void;
      }),
    } as unknown as BleManager;
    const service = new BleService({
      managerFactory: () => managerStub,
      requestAndroidPermissions: () =>
        Promise.resolve({ kind: "not_applicable" }),
    });

    const scanning = service.scan(() => undefined, 10_000);
    await flush();
    expect(scan.callback).not.toBeNull();
    scan.callback?.(
      { errorCode: BleErrorCode.BluetoothPoweredOff, message: "Powered off" },
      null,
    );

    const err = await scanning.then(
      () => null,
      (e: unknown) => e,
    );
    expect(mapBleError(err)).toEqual({ kind: "bluetooth-off" });
  });
});

describe("BleService monitor death", () => {
  type SeenDash = (error: null, device: { id: string }) => void;

  interface MonitorEntry {
    characteristic: string;
    fire: (error: Error | null, value: string | null) => void;
  }

  const makeMonitoredService = () => {
    const monitors: MonitorEntry[] = [];
    const showToast = jest.fn();
    const onDashLost = jest.fn();
    const dropped: (() => void)[] = [];
    const device = {
      id: "test-device",
      name: "CANShift-test",
      discoverAllServicesAndCharacteristics: jest.fn(() =>
        Promise.resolve(undefined),
      ),
      readCharacteristicForService: jest.fn(() =>
        Promise.resolve({ value: null }),
      ),
      monitorCharacteristicForService: jest.fn(
        (
          _service: string,
          characteristic: string,
          cb: (error: Error | null, char: { value: string } | null) => void,
        ) => {
          monitors.push({
            characteristic,
            fire: (error, value) => {
              cb(error, value === null ? null : { value });
            },
          });
          return { remove: jest.fn() };
        },
      ),
      onDisconnected: jest.fn((cb: () => void) => {
        dropped.push(cb);
        return { remove: jest.fn() };
      }),
      cancelConnection: jest.fn(() => Promise.resolve()),
    };
    const startDeviceScan = jest.fn();
    const connectToDevice = jest.fn(() => Promise.resolve(device));
    const managerStub = {
      destroy: jest.fn(),
      stopDeviceScan: jest.fn(),
      startDeviceScan,
      connectToDevice,
    } as unknown as BleManager;
    const service = new BleService({
      managerFactory: () => managerStub,
      requestAndroidPermissions: () =>
        Promise.resolve({ kind: "not_applicable" }),
      showToast,
      onDashLost,
    });
    const dropLink = () => {
      dropped.forEach((cb) => {
        cb();
      });
    };
    return {
      service,
      monitors,
      showToast,
      onDashLost,
      dropLink,
      startDeviceScan,
      connectToDevice,
    };
  };

  const attachedTo = (monitors: MonitorEntry[], characteristic: string) =>
    monitors.filter((m) => m.characteristic === characteristic);

  const killUntilLost = async (
    monitors: MonitorEntry[],
    characteristic: string,
  ): Promise<void> => {
    for (let round = 0; round < MONITOR_ATTACH_ATTEMPTS; round++) {
      const attached = attachedTo(monitors, characteristic);
      attached[attached.length - 1]?.fire(new Error("GATT went away"), null);
      jest.advanceTimersByTime(MONITOR_REVIVE_MAX_DELAY_MS);
      await flush();
    }
  };

  const MONITOR_ATTACH_ATTEMPTS = 3;
  const MONITOR_REVIVE_MAX_DELAY_MS = 1_000;
  const RECONNECT_FIRST_ATTEMPT_MAX_DELAY_MS = 1_200;

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ["setImmediate"] });
    useDeviceStore.getState().disconnect();
    useReconnectStore.getState().stop();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("re-subscribes a dead telemetry monitor instead of leaving it gone", async () => {
    const { service, monitors } = makeMonitoredService();
    await service.connect("test-device");

    expect(attachedTo(monitors, BLE_CHAR_TELE)).toHaveLength(1);

    attachedTo(monitors, BLE_CHAR_TELE)[0]?.fire(new Error("GATT"), null);
    jest.advanceTimersByTime(MONITOR_REVIVE_MAX_DELAY_MS);
    await flush();

    expect(attachedTo(monitors, BLE_CHAR_TELE)).toHaveLength(2);
    service.cancelReconnect();
  });

  it("treats a telemetry monitor that never comes back as a lost link", async () => {
    const { service, monitors } = makeMonitoredService();
    await service.connect("test-device");

    await killUntilLost(monitors, BLE_CHAR_TELE);

    expect(attachedTo(monitors, BLE_CHAR_TELE)).toHaveLength(
      MONITOR_ATTACH_ATTEMPTS,
    );
    expect(useDeviceStore.getState().error).toEqual({ kind: "disconnected" });
    expect(useReconnectStore.getState().isReconnecting).toBe(true);
    expect(useReconnectStore.getState().deviceId).toBe("test-device");
    service.cancelReconnect();
  });

  it("keeps a mute through the automatic reconnect after a lost link", async () => {
    const { service, monitors, startDeviceScan, connectToDevice } =
      makeMonitoredService();
    await service.connect("test-device");
    muteAlerts(["oil_pressure"]);
    startDeviceScan.mockImplementation(
      (_uuids: unknown, _options: unknown, onResult: SeenDash) => {
        onResult(null, { id: "test-device" });
      },
    );

    await killUntilLost(monitors, BLE_CHAR_TELE);
    jest.advanceTimersByTime(RECONNECT_FIRST_ATTEMPT_MAX_DELAY_MS);
    await flush();

    expect(connectToDevice).toHaveBeenCalledTimes(2);
    expect(useAlertsStore.getState().muted).toEqual(["oil_pressure"]);
    service.cancelReconnect();
  });

  it("does not chase a dash that left for workshop mode while the hold is on", async () => {
    const { service, monitors, onDashLost } = makeMonitoredService();
    await service.connect("test-device");
    service.holdReconnect();

    await killUntilLost(monitors, BLE_CHAR_TELE);

    expect(onDashLost).not.toHaveBeenCalled();
    expect(useReconnectStore.getState().isReconnecting).toBe(false);
    await expect(service.tryReconnectLastDevice()).resolves.toBe(false);
    service.releaseReconnect();
  });

  it("reports a dash lost when the link drops on its own", async () => {
    const { service, onDashLost, dropLink } = makeMonitoredService();
    await service.connect("test-device");

    dropLink();

    expect(onDashLost).toHaveBeenCalledTimes(1);
    service.cancelReconnect();
  });

  it("reports a dash lost when a monitor never comes back", async () => {
    const { service, monitors, onDashLost } = makeMonitoredService();
    await service.connect("test-device");

    await killUntilLost(monitors, BLE_CHAR_TELE);

    expect(onDashLost).toHaveBeenCalledTimes(1);
    service.cancelReconnect();
  });

  it("doesn't report a dash lost when the user disconnects", async () => {
    const { service, onDashLost, dropLink } = makeMonitoredService();
    await service.connect("test-device");

    await service.disconnect();
    dropLink();

    expect(onDashLost).not.toHaveBeenCalled();
  });

  it("declares the link lost so the dash starts its hold on the last values", async () => {
    const { service, monitors } = makeMonitoredService();
    await service.connect("test-device");
    useSignalsStore.getState().update({ r: 4000 });

    await killUntilLost(monitors, BLE_CHAR_TELE);

    const signals = useSignalsStore.getState();
    expect(signals.isLive).toBe(false);
    expect(signals.staleSinceMs).toBeGreaterThan(0);
    expect(signals.values).toEqual({ r: 4000 });
    service.cancelReconnect();
  });

  it("treats a status monitor that never comes back as a lost link", async () => {
    const { service, monitors } = makeMonitoredService();
    await service.connect("test-device");

    await killUntilLost(monitors, BLE_CHAR_STATUS);

    expect(useReconnectStore.getState().isReconnecting).toBe(true);
    service.cancelReconnect();
  });

  it("surfaces a toast when the lap monitor never comes back, without dropping the link", async () => {
    const { service, monitors, showToast } = makeMonitoredService();
    await service.connect("test-device");

    await killUntilLost(monitors, BLE_CHAR_TIMER_LAP);

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error", text1: "Lap stream lost" }),
    );
    expect(useReconnectStore.getState().isReconnecting).toBe(false);
    expect(useDeviceStore.getState().error).toBeNull();
    service.cancelReconnect();
  });

  it("surfaces a toast when the timer-state monitor never comes back", async () => {
    const { service, monitors, showToast } = makeMonitoredService();
    await service.connect("test-device");

    await killUntilLost(monitors, BLE_CHAR_TIMER_STATE);

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error", text1: "Timer sync lost" }),
    );
    service.cancelReconnect();
  });
});

describe("EXPO_PUBLIC_DISABLE_BLE", () => {
  const original = process.env.EXPO_PUBLIC_DISABLE_BLE as string | undefined;

  beforeEach(() => {
    (MockBleManager as jest.Mock).mockClear();
  });

  afterEach(() => {
    if (original === undefined) delete process.env.EXPO_PUBLIC_DISABLE_BLE;
    else process.env.EXPO_PUBLIC_DISABLE_BLE = original;
  });

  it('skips CoreBluetooth activation and reports BLE unavailable when set to "1"', () => {
    process.env.EXPO_PUBLIC_DISABLE_BLE = "1";
    new BleService();
    expect(MockBleManager).not.toHaveBeenCalled();
    expect(isBleAvailable()).toBe(false);
  });

  it("constructs the native manager when unset", () => {
    delete process.env.EXPO_PUBLIC_DISABLE_BLE;
    new BleService();
    expect(MockBleManager).toHaveBeenCalled();
  });
});

describe("mapBleError", () => {
  it("maps BlePermissionDeniedError to permission-denied/android", () => {
    expect(mapBleError(new BlePermissionDeniedError())).toEqual({
      kind: "permission-denied",
      platform: "android",
    });
  });

  it("no longer classifies on the message alone, so a look-alike stays unknown", () => {
    expect(mapBleError(new Error("android_ble_permission_denied"))).toEqual({
      kind: "unknown",
      message: "android_ble_permission_denied",
    });
  });

  it("classifies a scan error propagated verbatim, so the permission dialog is reachable", () => {
    expect(
      mapBleError({ errorCode: BleErrorCode.BluetoothPoweredOff }),
    ).toEqual({ kind: "bluetooth-off" });
  });

  it("maps BleErrorCode.BluetoothUnauthorized to permission-denied with current platform", () => {
    const result = mapBleError({
      errorCode: BleErrorCode.BluetoothUnauthorized,
    });
    expect(result.kind).toBe("permission-denied");
    if (result.kind === "permission-denied") {
      expect(["ios", "android"]).toContain(result.platform);
    }
  });

  it("maps BleErrorCode.BluetoothPoweredOff to bluetooth-off", () => {
    expect(
      mapBleError({ errorCode: BleErrorCode.BluetoothPoweredOff }),
    ).toEqual({
      kind: "bluetooth-off",
    });
  });

  it("maps BleErrorCode.DeviceNotFound to not-paired", () => {
    expect(mapBleError({ errorCode: BleErrorCode.DeviceNotFound })).toEqual({
      kind: "not-paired",
    });
  });

  it("maps BleErrorCode.DeviceConnectionFailed and OperationTimedOut to not-in-range", () => {
    expect(
      mapBleError({ errorCode: BleErrorCode.DeviceConnectionFailed }),
    ).toEqual({
      kind: "not-in-range",
    });
    expect(mapBleError({ errorCode: BleErrorCode.OperationTimedOut })).toEqual({
      kind: "not-in-range",
    });
  });

  it("maps disconnect-related error codes to disconnected", () => {
    expect(mapBleError({ errorCode: BleErrorCode.DeviceDisconnected })).toEqual(
      {
        kind: "disconnected",
      },
    );
    expect(mapBleError({ errorCode: BleErrorCode.DeviceNotConnected })).toEqual(
      {
        kind: "disconnected",
      },
    );
  });

  it("maps missing-characteristic / service codes to characteristic-missing", () => {
    expect(
      mapBleError({ errorCode: BleErrorCode.CharacteristicNotFound }),
    ).toEqual({
      kind: "characteristic-missing",
    });
    expect(mapBleError({ errorCode: BleErrorCode.ServiceNotFound })).toEqual({
      kind: "characteristic-missing",
    });
  });

  it("maps write/read failure codes to write-failed", () => {
    const result = mapBleError({
      errorCode: BleErrorCode.CharacteristicWriteFailed,
      reason: "gatt 133",
    });
    expect(result.kind).toBe("write-failed");
    if (result.kind === "write-failed") {
      expect(result.reason).toBe("gatt 133");
    }
  });

  it("falls back to unknown for arbitrary thrown values", () => {
    expect(mapBleError(undefined)).toEqual({
      kind: "unknown",
      message: "Unknown BLE error",
    });
    expect(mapBleError("string error")).toEqual({
      kind: "unknown",
      message: "string error",
    });
    expect(mapBleError({ errorCode: 99999 })).toMatchObject({
      kind: "unknown",
    });
  });
});
