import type { Device } from "react-native-ble-plx";
import { encodeTimerCommand, type TimerCommand } from "@canshift/core";
import {
  BLE_SERVICE_UUID,
  BLE_CHAR_SETTINGS,
  BLE_CHAR_CMD,
  BLE_CHAR_TIMER_CMD,
} from "../../constants/ble";
import { log } from "../../stores/log.store";
import { parseDeviceSettings } from "../ble.validators";
import { decodeBase64, encodeBase64 } from "../base64";
import { withGattRetry } from "../ble.retry";
import type { GattQueue } from "./ble-gatt-queue";

export interface DeviceSettings {
  brightness: number;
  sleep: number;
}

export type CmdPayload = Record<string, boolean | number | string>;

export const writeSettings = async (
  queue: GattQueue,
  device: Device,
  settings: DeviceSettings,
): Promise<void> => {
  const json = JSON.stringify(settings);
  await withGattRetry(() =>
    queue.run(() =>
      device.writeCharacteristicWithResponseForService(
        BLE_SERVICE_UUID,
        BLE_CHAR_SETTINGS,
        encodeBase64(json),
      ),
    ),
  );
};

export const readDeviceSettings = async (
  queue: GattQueue,
  device: Device,
): Promise<DeviceSettings | null> => {
  const char = await withGattRetry(() =>
    queue.run(() =>
      device.readCharacteristicForService(BLE_SERVICE_UUID, BLE_CHAR_SETTINGS),
    ),
  );
  if (!char.value) return null;
  const settings = parseDeviceSettings(decodeBase64(char.value));
  if (settings === null) {
    log("warn", "Ignoring malformed settings from device — using defaults");
    return null;
  }
  return settings;
};

export const writeTimerCommand = async (
  queue: GattQueue,
  device: Device,
  command: TimerCommand,
): Promise<void> => {
  await withGattRetry(() =>
    queue.run(() =>
      device.writeCharacteristicWithoutResponseForService(
        BLE_SERVICE_UUID,
        BLE_CHAR_TIMER_CMD,
        encodeBase64(encodeTimerCommand(command)),
      ),
    ),
  );
};

export const writeCmd = async (
  queue: GattQueue,
  device: Device,
  cmd: string,
  payload?: CmdPayload,
): Promise<void> => {
  const body: Record<string, boolean | number | string> = {
    cmd,
    ...(payload ?? {}),
  };
  await withGattRetry(() =>
    queue.run(() =>
      device.writeCharacteristicWithoutResponseForService(
        BLE_SERVICE_UUID,
        BLE_CHAR_CMD,
        encodeBase64(JSON.stringify(body)),
      ),
    ),
  );
};
