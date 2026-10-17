import * as SecureStore from "expo-secure-store";
import { persist } from "../../lib/persist";
import { tryParseJson } from "../../lib/try-parse-json";

const WORKSHOP_NETWORK_KEY = "canshift.workshopNetwork";

export interface WorkshopNetwork {
  ssid: string;
  password: string;
}

export const EMPTY_NETWORK: WorkshopNetwork = { ssid: "", password: "" };

const isNetwork = (value: unknown): value is WorkshopNetwork =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as Partial<WorkshopNetwork>).ssid === "string" &&
  typeof (value as Partial<WorkshopNetwork>).password === "string";

export const loadWorkshopNetwork = async (): Promise<WorkshopNetwork> => {
  const { value } = await persist(
    "Reading the dash Wi-Fi",
    () => SecureStore.getItemAsync(WORKSHOP_NETWORK_KEY),
    null,
  );
  const parsed = value === null ? null : tryParseJson(value);
  return parsed?.ok === true && isNetwork(parsed.value)
    ? parsed.value
    : EMPTY_NETWORK;
};

export const saveWorkshopNetwork = async (
  network: WorkshopNetwork,
): Promise<void> => {
  await persist(
    "Saving the dash Wi-Fi",
    () =>
      SecureStore.setItemAsync(WORKSHOP_NETWORK_KEY, JSON.stringify(network)),
    undefined,
  );
};
