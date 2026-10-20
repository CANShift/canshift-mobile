import { useEffect } from "react";
import { useDeviceStore } from "../stores/device.store";
import { useCanMonitorStore } from "../stores/can-monitor.store";
import { startCanMonitor, stopCanMonitor } from "../services/ble.service";
import { startSimCan, stopSimCan } from "../services/sim-can.service";

type CanSource = "ble" | "sim" | "none";

const CAN_SOURCES: Record<CanSource, () => () => void> = {
  ble: () => {
    if (!startCanMonitor()) useCanMonitorStore.getState().reset();
    return stopCanMonitor;
  },
  sim: () => {
    startSimCan();
    return stopSimCan;
  },
  none: () => {
    useCanMonitorStore.getState().reset();
    return () => undefined;
  },
};

const sourceFor = (mode: string, connected: boolean): CanSource => {
  if (mode === "sim") return "sim";
  return mode === "ble" && connected ? "ble" : "none";
};

export const useCanFeed = (): void => {
  const mode = useDeviceStore((s) => s.mode);
  const connected = useDeviceStore((s) => s.connectionState === "connected");
  const deviceId = useDeviceStore((s) => s.deviceId);
  const source = sourceFor(mode, connected);
  useEffect(() => CAN_SOURCES[source](), [source, deviceId]);
};
