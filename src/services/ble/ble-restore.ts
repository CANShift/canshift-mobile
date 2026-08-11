import type { BleRestoredState, Device } from "react-native-ble-plx";
import { BLE_DEVICE_NAME } from "../../constants/ble";
import { log } from "../../stores/log.store";
import { errText } from "../../lib/error-text";
import { useDeviceStore } from "../../stores/device.store";
import { useReconnectStore } from "../../stores/reconnect.store";
import { rememberDevice } from "../last-device";

export interface RestoreLink {
  removeSubscriptions: () => void;
  bind: (device: Device) => void;
  seedStatus: (device: Device) => Promise<void>;
  seedTimer: (device: Device) => Promise<void>;
  startStalenessTimer: () => void;
}

export const handleRestoredState = (
  link: RestoreLink,
  reconnect: (deviceId: string) => void,
  restoredState: BleRestoredState | null,
): void => {
  if (!restoredState) {
    log("info", "BLE restore: no prior state (fresh launch)");
    return;
  }

  const peripherals = restoredState.connectedPeripherals;
  if (peripherals.length === 0) {
    log("info", "BLE restore: state present but no connected peripherals");
    return;
  }

  if (peripherals.length > 1) {
    log(
      "warn",
      `BLE restore: ${String(peripherals.length)} peripherals restored — using first`,
    );
  }
  const device = peripherals[0];
  if (!device) return;

  log(
    "info",
    `BLE restore: re-binding to ${device.name ?? BLE_DEVICE_NAME} (${device.id})`,
  );

  void resumeRestoredDevice(link, reconnect, device);
};

const resumeRestoredDevice = async (
  link: RestoreLink,
  reconnect: (deviceId: string) => void,
  device: Device,
): Promise<void> => {
  try {
    await device.discoverAllServicesAndCharacteristics();
  } catch (err) {
    log(
      "warn",
      `BLE restore: service discovery failed — falling back to reconnect: ${errText(err)}`,
    );
    reconnect(device.id);
    return;
  }

  link.removeSubscriptions();
  link.bind(device);

  const store = useDeviceStore.getState();
  store.setDevice(device.id, device.name ?? BLE_DEVICE_NAME);
  store.setMode("ble");

  void rememberDevice(device.id);
  useReconnectStore.getState().stop();

  void link.seedStatus(device);
  void link.seedTimer(device);

  link.startStalenessTimer();
};
