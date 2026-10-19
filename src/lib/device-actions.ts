import { Linking } from "react-native";
import { disconnect } from "../services/ble.service";
import * as SimService from "../services/sim.service";
import { resetToScan } from "../navigation/navigation-ref";
import { reportDashFailure, reportFailure } from "./report-dash-failure";
import { STRINGS } from "../strings";

export const disconnectDash = async (): Promise<void> => {
  try {
    await disconnect();
    resetToScan();
  } catch (err) {
    reportDashFailure("Disconnect", err);
  }
};

export const endDemo = (): void => {
  SimService.stop();
  resetToScan();
};

export const openPhoneSettings = async (): Promise<void> => {
  try {
    await Linking.openSettings();
  } catch (err) {
    reportFailure("Open Settings", err, STRINGS.notifications.settingsFailed);
  }
};
