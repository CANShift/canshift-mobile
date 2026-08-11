import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { z } from "zod";
import { log } from "./log.store";
import { setBufferCap } from "./telemetry.store";
import { errText } from "../lib/error-text";

export type ReconnectBehavior = "auto" | "off";

export const TELEMETRY_BUFFER_OPTIONS = [1000, 3000, 6000] as const;
export type TelemetryBufferSize = (typeof TELEMETRY_BUFFER_OPTIONS)[number];

const STORAGE_KEY = "canshift.mobile.appSettings";

const settingsSchema = z.object({
  telemetryBufferSize: z.literal(TELEMETRY_BUFFER_OPTIONS),
  reconnectBehavior: z.enum(["auto", "off"]),
});

export type AppSettings = z.infer<typeof settingsSchema>;

const DEFAULT_SETTINGS: AppSettings = {
  telemetryBufferSize: 3000,
  reconnectBehavior: "auto",
};

const readPersisted = async (): Promise<AppSettings | null> => {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = settingsSchema.safeParse(JSON.parse(raw) as unknown);
    return parsed.success ? parsed.data : null;
  } catch (err) {
    log(
      "warn",
      `Failed to read app settings — using defaults: ${errText(err)}`,
    );
    return null;
  }
};

const writePersisted = async (settings: AppSettings): Promise<void> => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    log("warn", `Failed to persist app settings: ${errText(err)}`);
  }
};

interface AppSettingsState extends AppSettings {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setTelemetryBufferSize: (size: TelemetryBufferSize) => void;
  setReconnectBehavior: (behavior: ReconnectBehavior) => void;
}

const snapshot = (state: AppSettings): AppSettings => ({
  telemetryBufferSize: state.telemetryBufferSize,
  reconnectBehavior: state.reconnectBehavior,
});

export const useAppSettingsStore = create<AppSettingsState>()((set, get) => {
  const update = (patch: Partial<AppSettings>): void => {
    set(patch);
    void writePersisted(snapshot(get()));
  };

  return {
    ...DEFAULT_SETTINGS,
    hydrated: false,

    hydrate: async () => {
      if (get().hydrated) return;
      const persisted = await readPersisted();
      if (persisted !== null) {
        set({ ...persisted, hydrated: true });
        setBufferCap(persisted.telemetryBufferSize);
        return;
      }
      set({ ...DEFAULT_SETTINGS, hydrated: true });
      setBufferCap(DEFAULT_SETTINGS.telemetryBufferSize);
      void writePersisted(DEFAULT_SETTINGS);
    },

    setTelemetryBufferSize: (telemetryBufferSize) => {
      update({ telemetryBufferSize });
      setBufferCap(telemetryBufferSize);
    },
    setReconnectBehavior: (reconnectBehavior) => {
      update({ reconnectBehavior });
    },
  };
});
