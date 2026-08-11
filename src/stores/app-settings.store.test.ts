import * as SecureStore from "expo-secure-store";
import { useAppSettingsStore, type AppSettings } from "./app-settings.store";

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
  });

  it("falls back to defaults when nothing is persisted", async () => {
    await useAppSettingsStore.getState().hydrate();
    const s = useAppSettingsStore.getState();
    expect(s.hydrated).toBe(true);
    expect(s.telemetryBufferSize).toBe(3000);
    expect(s.reconnectBehavior).toBe("auto");
  });
});
