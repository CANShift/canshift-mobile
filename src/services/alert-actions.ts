import { ALERT_ACK_COMMAND, alertSourceId } from "@canshift/core";
import { sendCmd } from "./ble.service";
import { useDeviceStore } from "../stores/device.store";
import {
  acknowledgeAlert,
  muteAlerts,
  reopenAlert,
  unmuteAlert,
} from "../stores/alerts.store";
import { reportDashFailure } from "../lib/report-dash-failure";
import type { AlertEntry } from "../lib/alert-model";

type Acknowledged = Pick<AlertEntry, "key" | "origin">;

const isDashLinked = (): boolean => {
  const { connectionState, mode } = useDeviceStore.getState();
  return connectionState === "connected" && mode === "ble";
};

const sendAcknowledge = async (alert: Acknowledged): Promise<void> => {
  try {
    await sendCmd(ALERT_ACK_COMMAND, { source: alertSourceId(alert.origin) });
  } catch (err) {
    reportDashFailure(`Alert acknowledge for ${alert.key}`, err);
  }
};

export const alertActions = {
  acknowledge: (alert: Acknowledged): void => {
    acknowledgeAlert(alert.key);
    if (!isDashLinked()) return;
    void sendAcknowledge(alert);
  },
  show: reopenAlert,
  muteAll: muteAlerts,
  unmute: unmuteAlert,
};
