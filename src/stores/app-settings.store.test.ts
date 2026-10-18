import * as SecureStore from "expo-secure-store";
import { useAppSettingsStore, type AppSettings } from "./app-settings.store";
import { STRINGS } from "../strings";

const mockToast = jest.fn();

jest.mock("../components/ui/toast", () => ({
  Toast: {
    show: (params: unknown) => {
      mockToast(params);
    },
  },
}));

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    getItemAsync: jest.fn((key: string) =>
      Promise.resolve(store.get(key) ?? null),
    ),
    setItemAsync: jest.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
});

const mockStore = (SecureStore as unknown as { __store: Map<string, string> })
  .__store;
const STORAGE_KEY = "canshift.mobile.appSettings";

const resetStore = (): void => {
  mockStore.clear();
  jest.clearAllMocks();
  useAppSettingsStore.setState({
    telemetryBufferSize: 3000,
    reconnectBehavior: "auto",
    keepScreenOn: true,
    hydrated: false,
  });
};

describe("app-settings.store", () => {
  beforeEach(resetStore);

  it("exposes sensible defaults before hydration", () => {
    const s = useAppSettingsStore.getState();
    expect(s.hydrated).toBe(false);
    expect(s.telemetryBufferSize).toBe(3000);
    expect(s.reconnectBehavior).toBe("auto");
  });

  it("persists a setting change and reflects it in state", async () => {
    useAppSettingsStore.getState().setReconnectBehavior("off");
    expect(useAppSettingsStore.getState().reconnectBehavior).toBe("off");
    await Promise.resolve();
    const raw = mockStore.get(STORAGE_KEY);
    expect(raw).toBeDefined();
    const persisted = JSON.parse(raw ?? "{}") as AppSettings;
    expect(persisted.reconnectBehavior).toBe("off");
  });

  it("hydrates from a persisted blob", async () => {
    mockStore.set(
      STORAGE_KEY,
      JSON.stringify({
        telemetryBufferSize: 6000,
        reconnectBehavior: "off",
      }),
    );
    await useAppSettingsStore.getState().hydrate();
    const s = useAppSettingsStore.getState();
    expect(s.hydrated).toBe(true);
    expect(s.telemetryBufferSize).toBe(6000);
    expect(s.reconnectBehavior).toBe("off");
    expect(s.keepScreenOn).toBe(true);
  });

  it("persists the keep-screen-on choice", async () => {
    useAppSettingsStore.getState().setKeepScreenOn(false);
    await Promise.resolve();
    const persisted = JSON.parse(
      mockStore.get(STORAGE_KEY) ?? "{}",
    ) as AppSettings;
    expect(persisted.keepScreenOn).toBe(false);
  });

  it("falls back to defaults when nothing is persisted", async () => {
    await useAppSettingsStore.getState().hydrate();
    const s = useAppSettingsStore.getState();
    expect(s.hydrated).toBe(true);
    expect(s.telemetryBufferSize).toBe(3000);
    expect(s.reconnectBehavior).toBe("auto");
  });

  it("tells the user when a setting could not be saved", async () => {
    jest
      .mocked(SecureStore.setItemAsync)
      .mockRejectedValueOnce(new Error("keychain locked"));
    useAppSettingsStore.getState().setKeepScreenOn(false);
    await new Promise(setImmediate);
    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith({
      type: "error",
      text1: STRINGS.device.settingsNotSaved,
    });
  });

  it("tells the user once when the saved settings could not be read, and keeps them", async () => {
    jest
      .mocked(SecureStore.getItemAsync)
      .mockRejectedValueOnce(new Error("keychain locked"));
    await useAppSettingsStore.getState().hydrate();
    await new Promise(setImmediate);
    expect(useAppSettingsStore.getState().telemetryBufferSize).toBe(3000);
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith({
      type: "error",
      text1: STRINGS.device.settingsUnreadable,
    });
  });

  it("replaces a corrupt blob with the defaults without a toast", async () => {
    mockStore.set(STORAGE_KEY, "{not json");
    await useAppSettingsStore.getState().hydrate();
    await new Promise(setImmediate);
    expect(useAppSettingsStore.getState().telemetryBufferSize).toBe(3000);
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
    expect(mockToast).not.toHaveBeenCalled();
  });
});
