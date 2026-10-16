import { cancelReconnect, tryReconnectLastDevice } from "./ble.service";
import { useDeviceStore } from "../stores/device.store";
import { resetToScan } from "../navigation/navigation-ref";

export const backToScan = (): void => {
  useDeviceStore.getState().clearError();
  resetToScan();
};

export const cancelReconnectToScan = (): void => {
  cancelReconnect();
  backToScan();
};

export const retryReconnect = async (): Promise<void> => {
  const started = await tryReconnectLastDevice();
  if (!started) backToScan();
};
