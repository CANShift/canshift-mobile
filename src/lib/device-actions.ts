import { disconnect } from "../services/ble.service";
import * as SimService from "../services/sim.service";
import { resetToScan } from "../navigation/navigation-ref";
import { reportDashFailure } from "./report-dash-failure";

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
