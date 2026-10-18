import { useCallback } from "react";
import { Linking } from "react-native";
import { useAppSettingsStore } from "../stores/app-settings.store";
import { useReconnectStore } from "../stores/reconnect.store";
import { useDeviceStore } from "../stores/device.store";
import { cancelReconnect } from "../services/ble.service";
import * as SimService from "../services/sim.service";
import { scanView, type ScanView } from "../lib/scan-view";
import { STRINGS } from "../strings";
import { useDeviceScan, type DeviceScan } from "./use-device-scan";

export interface ScanNavigation {
  toConnected: () => void;
  toInfo: () => void;
}

export interface ScanScreenModel {
  view: ScanView;
  scan: DeviceScan;
  lastDashName: string;
  continueFirstRun: () => void;
  startDemo: () => void;
  openSettings: () => void;
  openInfo: () => void;
  cancelReconnect: () => void;
}

const useScanView = (scan: DeviceScan): ScanView => {
  const promptSeen = useAppSettingsStore((s) => s.blePromptSeen);
  const reconnecting = useReconnectStore((s) => s.isReconnecting);
  return scanView({
    promptSeen,
    denied: scan.denied,
    reconnecting,
    scanning: scan.scanning,
    deviceCount: scan.devices.length,
  });
};

const useContinueFirstRun = (
  startScan: DeviceScan["startScan"],
): (() => void) => {
  const markSeen = useAppSettingsStore((s) => s.markBlePromptSeen);
  return useCallback(() => {
    markSeen();
    void startScan();
  }, [markSeen, startScan]);
};

export const useScanScreen = (nav: ScanNavigation): ScanScreenModel => {
  const scan = useDeviceScan(nav.toConnected);
  const lastDashName =
    useDeviceStore((s) => s.lastDashName) ?? STRINGS.connect.theDash;
  return {
    view: useScanView(scan),
    scan,
    lastDashName,
    continueFirstRun: useContinueFirstRun(scan.startScan),
    startDemo: () => {
      SimService.start();
      nav.toConnected();
    },
    openSettings: () => void Linking.openSettings(),
    openInfo: nav.toInfo,
    cancelReconnect,
  };
};
