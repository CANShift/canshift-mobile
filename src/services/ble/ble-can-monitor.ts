import type { Device, Subscription } from "react-native-ble-plx";
import { decodeCanMonitorFrame } from "@canshift/core/wire";
import { BLE_CHAR_CAN_MONITOR } from "../../constants/ble";
import { log } from "../../stores/log.store";
import { useCanMonitorStore } from "../../stores/can-monitor.store";
import { decodeBase64ToBytes } from "../base64";
import { attachMonitor, type MonitorHost } from "./ble-monitors";

const handleCanMonitorFrame = (raw: string): void => {
  const frame = decodeCanMonitorFrame(decodeBase64ToBytes(raw));
  if (frame === null) {
    log("warn", "BLE: ignoring an unreadable CAN monitor frame");
    return;
  }
  useCanMonitorStore.getState().ingest(frame);
};

export class CanMonitorFeed {
  private sub: Subscription | null = null;

  constructor(
    private readonly host: MonitorHost,
    private readonly currentDevice: () => Device | null,
  ) {}

  start(): boolean {
    const device = this.currentDevice();
    if (!device) return false;
    this.stop();
    const store = useCanMonitorStore.getState();
    store.reset();
    store.setFeed("listening");
    attachMonitor(
      this.host,
      {
        device,
        characteristic: BLE_CHAR_CAN_MONITOR,
        label: "CAN monitor",
        handle: handleCanMonitorFrame,
        assign: (sub) => {
          this.sub = sub;
        },
        onLost: () => {
          log("warn", "BLE: this dash does not stream CAN frames");
          useCanMonitorStore.getState().setFeed("unavailable");
        },
      },
      0,
    );
    return true;
  }

  stop(): void {
    this.sub?.remove();
    this.sub = null;
  }
}
