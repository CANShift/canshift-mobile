import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import * as BleService from "../services/ble.service";
import type { ScanResult } from "../services/ble.service";
import { mapBleError } from "../services/ble.errors";
import { bleErrorMessage } from "../services/ble-error-message";
import { blePermissionMessage } from "../services/ble-permission-message";
import { getLastDevice } from "../services/last-device";
import { orderByLastPaired } from "../lib/device-order";
import type { BlePermissionPlatform } from "../components/BlePermissionDialog";

const SCAN_TIMEOUT_MS = 10000;

export type ScanStatus = "searching" | "no-results" | "idle";

interface DeviceScanOptions {
  onUnauthorized: (platform: BlePermissionPlatform) => void;
  onConnected: () => void;
}

export const useDeviceScan = ({
  onUnauthorized,
  onConnected,
}: DeviceScanOptions) => {
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [lastPairedId, setLastPairedId] = useState<string | null>(null);

  useEffect(() => {
    void getLastDevice().then(setLastPairedId);
  }, []);

  const surfaceError = useCallback(
    (err: unknown): void => {
      const mapped = mapBleError(err);
      if (mapped.kind === "permission-denied") {
        onUnauthorized(mapped.platform);
        return;
      }
      const { title, body } = bleErrorMessage(mapped);
      Alert.alert(title, body);
    },
    [onUnauthorized],
  );

  const startScan = useCallback(async () => {
    setDevices([]);
    setScanning(true);
    try {
      const state = await BleService.getBlePermissionState();
      if (state.kind === "unauthorized") {
        onUnauthorized(state.platform);
        return;
      }
      if (state.kind !== "ok") {
        const { title, body } = blePermissionMessage(state.kind);
        Alert.alert(title, body);
        return;
      }
      await BleService.scan((device) => {
        setDevices((prev) =>
          prev.find((d) => d.id === device.id) ? prev : [...prev, device],
        );
      }, SCAN_TIMEOUT_MS);
      setHasScanned(true);
    } catch (err) {
      surfaceError(err);
    } finally {
      setScanning(false);
    }
  }, [onUnauthorized, surfaceError]);

  const stopScan = useCallback(() => {
    BleService.stopScan();
  }, []);

  const connectTo = useCallback(
    async (device: ScanResult) => {
      BleService.stopScan();
      setConnectingId(device.id);
      try {
        await BleService.connect(device.id);
        onConnected();
      } catch (err) {
        surfaceError(err);
      } finally {
        setConnectingId(null);
      }
    },
    [onConnected, surfaceError],
  );

  const status: ScanStatus = scanning
    ? "searching"
    : hasScanned && devices.length === 0
      ? "no-results"
      : "idle";

  return {
    devices: orderByLastPaired(devices, lastPairedId),
    scanning,
    hasScanned,
    connectingId,
    status,
    startScan,
    stopScan,
    connectTo,
  };
};
