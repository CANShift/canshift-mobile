import * as SecureStore from "expo-secure-store";
import { persist } from "../lib/persist";

const LAST_DEVICE_ID_KEY = "canshift.lastBleDeviceId";

export const rememberDevice = async (id: string): Promise<void> => {
  await persist(
    "Persisting the last device id",
    () => SecureStore.setItemAsync(LAST_DEVICE_ID_KEY, id),
    undefined,
  );
};

export const forgetDevice = async (): Promise<void> => {
  await persist(
    "Forgetting the last device id",
    () => SecureStore.deleteItemAsync(LAST_DEVICE_ID_KEY),
    undefined,
  );
};

export const getLastDevice = async (): Promise<string | null> => {
  const { value } = await persist(
    "Reading the last device id",
    () => SecureStore.getItemAsync(LAST_DEVICE_ID_KEY),
    null,
  );
  return value;
};
