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

export const useDeviceScan = (onConnected: () => void): DeviceScan => {
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [denied, setDenied] = useState(false);
  const [connecting, setConnecting] = useState<ScanResult | null>(null);
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [lastPairedId, setLastPairedId] = useState<string | null>(null);

  useEffect(() => {
    void getLastDevice().then(setLastPairedId);
  }, []);

  const surfaceError = useCallback((err: unknown): void => {
    const mapped = mapBleError(err);
    if (mapped.kind === "permission-denied") {
      setDenied(true);
      return;
    }
    const { title, body } = bleErrorMessage(mapped);
    Alert.alert(title, body);
  }, []);

  const runScan = useCallback(async () => {
    const state = await BleService.getBlePermissionState();
    if (state.kind === "unauthorized") {
      setDenied(true);
      return;
    }
    if (state.kind !== "ok") {
      const { title, body } = blePermissionMessage(state.kind);
      Alert.alert(title, body);
      return;
    }
    setDenied(false);
    await BleService.scan((device) => {
      setDevices((prev) => addDevice(prev, device));
    }, SCAN_TIMEOUT_MS);
    setHasScanned(true);
  }, []);

  const startScan = useCallback(async () => {
    setDevices([]);
    setScanning(true);
    try {
      await runScan();
    } catch (err) {
      surfaceError(err);
    } finally {
      setScanning(false);
    }
  }, [runScan, surfaceError]);

  const connectTo = useCallback(
    async (device: ScanResult) => {
      BleService.stopScan();
      setConnecting(device);
      try {
        await BleService.connect(device.id);
        onConnected();
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

  return {
    devices: orderByLastPaired(devices, lastPairedId),
    lastPairedId,
    scanning,
    hasScanned,
    denied,
    connecting,
    startScan,
    stopScan: BleService.stopScan,
    connectTo,
    cancelConnect,
  };
};
