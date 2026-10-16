import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { CURRENT_SCHEMA_VERSION } from "@canshift/core";
import { useDeviceStore } from "../stores/device.store";
import { useSignalValue } from "../stores/signals.store";
import { readAppVersion } from "../lib/expo-version";
import { firmwareLabel } from "../lib/device-labels";
import { formatWidgetValue } from "../components/widgets/widget-value";
import { NO_VALUE } from "../lib/tile-state";
import { SIGNAL_META } from "../constants/ble";
import { STRINGS } from "../strings";
import { useLink } from "./use-link";
import type { Link } from "../lib/link-model";

export interface InfoRowModel {
  label: string;
  value: string;
}

export type DeviceDialog = "none" | "disconnect" | "endDemo";

export interface DeviceScreenModel {
  link: Link;
  dashName: string;
  rows: readonly InfoRowModel[];
  dialog: DeviceDialog;
  setDialog: (dialog: DeviceDialog) => void;
}

const batteryText = (volts: number | undefined): string =>
  volts === undefined
    ? NO_VALUE
    : `${formatWidgetValue(volts, SIGNAL_META.bat.decimals)} ${SIGNAL_META.bat.unit}`;

const useInfoRows = (link: Link): InfoRowModel[] => {
  const { deviceName, deviceId, firmwareVersion } = useDeviceStore(
    useShallow((s) => ({
      deviceName: s.deviceName,
      deviceId: s.deviceId,
      firmwareVersion: s.firmwareVersion,
    })),
  );
  const volts = useSignalValue("bat");
  const firmware = firmwareLabel(
    link === "demo",
    link === "connected",
    firmwareVersion,
  );
  return [
    { label: STRINGS.device.dashName, value: deviceName ?? NO_VALUE },
    { label: STRINGS.device.deviceId, value: deviceId ?? NO_VALUE },
    { label: STRINGS.device.firmware, value: firmware },
    {
      label: STRINGS.device.configVersion,
      value: `v${CURRENT_SCHEMA_VERSION}`,
    },
    { label: STRINGS.device.appVersion, value: readAppVersion() ?? NO_VALUE },
    { label: STRINGS.device.dashBattery, value: batteryText(volts) },
  ];
};

export const useDeviceScreen = (): DeviceScreenModel => {
  const link = useLink();
  const dashName =
    useDeviceStore((s) => s.deviceName ?? s.lastDashName) ??
    STRINGS.connect.theDash;
  const [dialog, setDialog] = useState<DeviceDialog>("none");
  return { link, dashName, rows: useInfoRows(link), dialog, setDialog };
};
