import { sendCmd } from "./ble.service";
import { log } from "../stores/log.store";
import { useDeviceStore } from "../stores/device.store";
import { useCriticalAlertStore } from "../stores/critical-alert.store";
import { errText } from "../lib/error-text";
import type { SignalKey } from "../constants/ble";

export const ALERT_ACK_CMD = "alert_ack";

const isDeviceDriven = (): boolean => {
  const { connectionState, mode } = useDeviceStore.getState();
  return connectionState === "connected" && mode === "ble";
};

const sendAckToDash = (key: SignalKey): void => {
  void sendCmd(ALERT_ACK_CMD, { signal: key }).catch((err: unknown) => {
    log(
      "warn",
      `Alert acknowledge for '${key}' failed over BLE: ${errText(err)}`,
    );
  });
};

export const criticalAlertControl = {
  acknowledge: (key: SignalKey): void => {
    useCriticalAlertStore.getState().acknowledge(key);
    if (!isDeviceDriven()) return;
    sendAckToDash(key);
  },

  mute: (key: SignalKey): void => {
    useCriticalAlertStore.getState().mute(key);
  },
};
