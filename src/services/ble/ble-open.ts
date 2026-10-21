import type { BleManager, Device } from "react-native-ble-plx";
import { BLE_CONNECT_TIMEOUT_MS, BLE_PREFERRED_MTU } from "../../constants/ble";
import type { DeviceLink } from "./ble-link";

export const openDashDevice = async (
  manager: BleManager,
  link: DeviceLink,
  deviceId: string,
): Promise<Device> => {
  const device = await manager.connectToDevice(deviceId, {
    autoConnect: false,
    requestMTU: BLE_PREFERRED_MTU,
    timeout: BLE_CONNECT_TIMEOUT_MS,
  });
  await device.discoverAllServicesAndCharacteristics();
  link.setDevice(device);
  await link.seedStatus(device);
  await link.seedTimer(device);
  await link.seedAlert(device);
  await link.seedPages(device);
  return device;
};
