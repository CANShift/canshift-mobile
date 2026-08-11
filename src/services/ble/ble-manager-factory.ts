import { BleManager, State, type BleRestoredState } from "react-native-ble-plx";
import { log } from "../../stores/log.store";
import { errText } from "../../lib/error-text";

const BLE_RESTORE_STATE_IDENTIFIER = "canshift.ble.central";

let s_bleNativeAvailable = true;

export const isBleAvailable = (): boolean => s_bleNativeAvailable;

const createInertBleManager = (): BleManager => {
  const unavailable = (): Promise<never> =>
    Promise.reject(
      new Error(
        "Bluetooth is unavailable in this build — use a development build.",
      ),
    );
  const inert = {
    state: () => Promise.resolve(State.PoweredOff),
    startDeviceScan: () => undefined,
    stopDeviceScan: () => undefined,
    connectToDevice: () => unavailable(),
    destroy: () => Promise.resolve(),
  };
  return inert as unknown as BleManager;
};

export const createBleManager = (
  onRestore: (restoredState: BleRestoredState | null) => void,
): BleManager => {
  if (process.env.EXPO_PUBLIC_DISABLE_BLE === "1") {
    s_bleNativeAvailable = false;
    log(
      "warn",
      "BLE disabled via EXPO_PUBLIC_DISABLE_BLE — no CoreBluetooth activation",
    );
    return createInertBleManager();
  }
  try {
    return new BleManager({
      restoreStateIdentifier: BLE_RESTORE_STATE_IDENTIFIER,
      restoreStateFunction: onRestore,
    });
  } catch (err) {
    s_bleNativeAvailable = false;
    log(
      "warn",
      `BLE native module unavailable (Expo Go?) — Bluetooth disabled: ${errText(err)}`,
    );
    return createInertBleManager();
  }
};
