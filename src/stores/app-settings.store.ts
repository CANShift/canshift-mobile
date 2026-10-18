import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { z } from "zod";
import { setBufferCap } from "./telemetry.store";
import { reportFailure } from "../lib/report-dash-failure";
import { STRINGS } from "../strings";
import { tryParseJson } from "../lib/try-parse-json";

export type ReconnectBehavior = "auto" | "off";

export const TELEMETRY_BUFFER_OPTIONS = [1000, 3000, 6000] as const;
export type TelemetryBufferSize = (typeof TELEMETRY_BUFFER_OPTIONS)[number];

const STORAGE_KEY = "canshift.mobile.appSettings";

const settingsSchema = z.object({
  telemetryBufferSize: z.literal(TELEMETRY_BUFFER_OPTIONS),
  reconnectBehavior: z.enum(["auto", "off"]),
  keepScreenOn: z.boolean().default(true),
  blePromptSeen: z.boolean().default(false),
});

export type AppSettings = z.infer<typeof settingsSchema>;

const DEFAULT_SETTINGS: AppSettings = {
  telemetryBufferSize: 3000,
  reconnectBehavior: "auto",
  keepScreenOn: true,
  blePromptSeen: false,
};

type PersistedRead =
  | { kind: "found"; settings: AppSettings }
  | { kind: "missing" }
  | { kind: "unreadable" };

const parseSettings = (raw: string | null): PersistedRead => {
  const json = raw === null ? null : tryParseJson(raw);
  if (!json?.ok) return { kind: "missing" };
  const parsed = settingsSchema.safeParse(json.value);
  return parsed.success
    ? { kind: "found", settings: parsed.data }
    : { kind: "missing" };
};

const readPersisted = async (): Promise<PersistedRead> => {
  try {
    return parseSettings(await SecureStore.getItemAsync(STORAGE_KEY));
  } catch (err) {
    reportFailure(
      "Reading app settings",
      err,
      STRINGS.device.settingsUnreadable,
    );
    return { kind: "unreadable" };
  }
};

const writePersisted = async (settings: AppSettings): Promise<void> => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    reportFailure("Saving app settings", err, STRINGS.device.settingsNotSaved);
  }
};

interface AppSettingsState extends AppSettings {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setTelemetryBufferSize: (size: TelemetryBufferSize) => void;
  setReconnectBehavior: (behavior: ReconnectBehavior) => void;
  setKeepScreenOn: (keepScreenOn: boolean) => void;
  markBlePromptSeen: () => void;
}

const snapshot = (state: AppSettings): AppSettings => ({
  telemetryBufferSize: state.telemetryBufferSize,
  reconnectBehavior: state.reconnectBehavior,
  keepScreenOn: state.keepScreenOn,
  blePromptSeen: state.blePromptSeen,
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
      const settings =
        persisted.kind === "found" ? persisted.settings : DEFAULT_SETTINGS;
      set({ ...settings, hydrated: true });
      setBufferCap(settings.telemetryBufferSize);
      if (persisted.kind === "missing") void writePersisted(DEFAULT_SETTINGS);
    },

    setTelemetryBufferSize: (telemetryBufferSize) => {
      update({ telemetryBufferSize });
      setBufferCap(telemetryBufferSize);
    },
    setReconnectBehavior: (reconnectBehavior) => {
      update({ reconnectBehavior });
    },
    setKeepScreenOn: (keepScreenOn) => {
      update({ keepScreenOn });
    },
    markBlePromptSeen: () => {
      update({ blePromptSeen: true });
    },
  };
});
