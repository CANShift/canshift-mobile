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

export const useScanScreen = (nav: ScanNavigation): ScanScreenModel => {
  const scan = useDeviceScan(nav.toConnected);
  const promptSeen = useAppSettingsStore((s) => s.blePromptSeen);
  const markSeen = useAppSettingsStore((s) => s.markBlePromptSeen);
  const reconnecting = useReconnectStore((s) => s.isReconnecting);
  const lastDashName =
    useDeviceStore((s) => s.lastDashName) ?? STRINGS.connect.theDash;
  const view = scanView({
    promptSeen,
    denied: scan.denied,
    reconnecting,
    scanning: scan.scanning,
    deviceCount: scan.devices.length,
  });
  const { startScan } = scan;
  const continueFirstRun = useCallback(() => {
    markSeen();
    void startScan();
  }, [markSeen, startScan]);
  return {
    view,
    scan,
    lastDashName,
    continueFirstRun,
    startDemo: () => {
      SimService.start();
      nav.toConnected();
    },
    openSettings: () => void Linking.openSettings(),
    openInfo: nav.toInfo,
    cancelReconnect,
  };
};
