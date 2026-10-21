import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import * as BleService from "../services/ble.service";
import type { ScanResult } from "../services/ble.service";
import { mapBleError } from "../services/ble.errors";
import { bleErrorMessage } from "../services/ble-error-message";
import { blePermissionMessage } from "../services/ble-permission-message";
import { getLastDevice } from "../services/last-device";
import { orderByLastPaired } from "../lib/device-order";
import { reportDashFailure } from "../lib/report-dash-failure";

const SCAN_TIMEOUT_MS = 10000;

export interface DeviceScan {
  devices: readonly ScanResult[];
  lastPairedId: string | null;
  scanning: boolean;
  hasScanned: boolean;
  denied: boolean;
  connecting: ScanResult | null;
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectTo: (device: ScanResult) => Promise<void>;
  cancelConnect: () => Promise<void>;
}

const addDevice = (devices: ScanResult[], device: ScanResult): ScanResult[] =>
  devices.some((known) => known.id === device.id)
    ? devices
    : [...devices, device];

type DeniedSetter = (denied: boolean) => void;

const useLastPairedId = (): string | null => {
  const [lastPairedId, setLastPairedId] = useState<string | null>(null);
  useEffect(() => {
    void getLastDevice().then(setLastPairedId);
  }, []);
  return lastPairedId;
};

const useSurfaceError = (setDenied: DeniedSetter): ((err: unknown) => void) =>
  useCallback(
    (err: unknown): void => {
      const mapped = mapBleError(err);
      if (mapped.kind === "permission-denied") {
        setDenied(true);
        return;
      }
      const { title, body } = bleErrorMessage(mapped);
      Alert.alert(title, body);
    },
    [setDenied],
  );

const scanAllowed = async (setDenied: DeniedSetter): Promise<boolean> => {
  const state = await BleService.getBlePermissionState();
  if (state.kind === "unauthorized") {
    setDenied(true);
    return false;
  }
  if (state.kind !== "ok") {
    const { title, body } = blePermissionMessage(state.kind);
    Alert.alert(title, body);
    return false;
  }
  setDenied(false);
  return true;
};

const useScanner = (
  setDenied: DeniedSetter,
  surfaceError: (err: unknown) => void,
): Pick<DeviceScan, "devices" | "scanning" | "hasScanned" | "startScan"> => {
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const startScan = useCallback(async () => {
    setDevices([]);
    setScanning(true);
    try {
      if (!(await scanAllowed(setDenied))) return;
      await BleService.scan((device) => {
        setDevices((prev) => addDevice(prev, device));
      }, SCAN_TIMEOUT_MS);
      setHasScanned(true);
    } catch (err) {
      surfaceError(err);
    } finally {
      setScanning(false);
    }
  }, [setDenied, surfaceError]);
  return { devices, scanning, hasScanned, startScan };
};

const useConnector = (
  onConnected: () => void,
  surfaceError: (err: unknown) => void,
): Pick<DeviceScan, "connecting" | "connectTo" | "cancelConnect"> => {
  const [connecting, setConnecting] = useState<ScanResult | null>(null);
  const connectTo = useCallback(
    async (device: ScanResult) => {
      BleService.stopScan();
      setConnecting(device);
      try {
        if (await BleService.connect(device.id)) onConnected();
      } catch (err) {
        surfaceError(err);
      } finally {
        setConnecting(null);
      }
    },
    [onConnected, surfaceError],
  );
  const cancelConnect = useCallback(async () => {
    setConnecting(null);
    try {
      await BleService.disconnect();
    } catch (err) {
      reportDashFailure("Cancel connect", err);
    }
  }, []);
  return { connecting, connectTo, cancelConnect };
};

export const useDeviceScan = (onConnected: () => void): DeviceScan => {
  const [denied, setDenied] = useState(false);
  const lastPairedId = useLastPairedId();
  const surfaceError = useSurfaceError(setDenied);
  const scanner = useScanner(setDenied, surfaceError);
  const connector = useConnector(onConnected, surfaceError);
  return {
    ...scanner,
    ...connector,
    devices: orderByLastPaired(scanner.devices, lastPairedId),
    lastPairedId,
    denied,
    stopScan: BleService.stopScan,
  };
};
