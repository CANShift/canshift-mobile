import {
  ALERT_ACK_COMMAND,
  alertSourceId,
  type AlertSource,
} from "@canshift/core";
import { sendCmd } from "./ble.service";
import { useDeviceStore } from "../stores/device.store";
import {
  acknowledgeAlert,
  muteAlerts,
  reopenAlert,
  unmuteAlert,
} from "../stores/alerts.store";
import { reportDashFailure } from "../lib/report-dash-failure";

const isDashLinked = (): boolean => {
  const { connectionState, mode } = useDeviceStore.getState();
  return connectionState === "connected" && mode === "ble";
};

const sendAcknowledge = async (source: AlertSource): Promise<void> => {
  try {
    await sendCmd(ALERT_ACK_COMMAND, { source: alertSourceId(source) });
  } catch (err) {
    reportDashFailure(`Alert acknowledge for ${source}`, err);
  }
};

export const alertActions = {
  acknowledge: (source: AlertSource): void => {
    acknowledgeAlert(source);
    if (!isDashLinked()) return;
    void sendAcknowledge(source);
  },
  show: reopenAlert,
  muteAll: muteAlerts,
  unmute: unmuteAlert,
};
