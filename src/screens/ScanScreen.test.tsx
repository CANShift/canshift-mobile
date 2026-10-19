import * as React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import ScanScreen from "./ScanScreen";
import type { RootStackParamList } from "../navigation";
import { useAppSettingsStore } from "../stores/app-settings.store";
import { useReconnectStore } from "../stores/reconnect.store";
import { useDeviceStore } from "../stores/device.store";
import { STRINGS } from "../strings";

type Found = (device: {
  id: string;
  name: string;
  rssi: number | null;
}) => void;

let mockPermission: { kind: string; platform?: string } = { kind: "ok" };
let mockFound: Found = () => undefined;
let mockFinishScan: () => void = () => undefined;
const mockConnect = jest.fn((_id: string) => Promise.resolve());
const mockSimStart = jest.fn();

jest.mock("../services/ble.service", () => ({
  getBlePermissionState: () => Promise.resolve(mockPermission),
  scan: (onFound: Found) => {
    mockFound = onFound;
    return new Promise<void>((resolve) => {
      mockFinishScan = resolve;
    });
  },
  stopScan: () => {
    mockFinishScan();
  },
  connect: (id: string) => mockConnect(id),
  disconnect: () => Promise.resolve(),
  cancelReconnect: jest.fn(),
}));
jest.mock("../services/last-device", () => ({
  getLastDevice: () => Promise.resolve("dash-a"),
}));
jest.mock("../services/sim.service", () => ({
  start: () => {
    mockSimStart();
  },
}));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const navigation = { replace: jest.fn(), navigate: jest.fn() };

const renderScan = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ScanScreen
        {...({ navigation } as unknown as NativeStackScreenProps<
          RootStackParamList,
          "Scan"
        >)}
      />
    </SafeAreaProvider>,
  );

type View = Awaited<ReturnType<typeof renderScan>>;

const press = async (view: View, label: string) => {
  await act(async () => {
    void fireEvent.press(view.getByLabelText(label));
    await Promise.resolve();
  });
};

const initialReconnect = useReconnectStore.getState();
const initialDevice = useDeviceStore.getState();

describe("Scan", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPermission = { kind: "ok" };
    useAppSettingsStore.setState({ blePromptSeen: true });
    useReconnectStore.setState(initialReconnect, true);
    useDeviceStore.setState(initialDevice, true);
  });

  it("explains Bluetooth before the first iOS prompt", async () => {
    useAppSettingsStore.setState({ blePromptSeen: false });
    const view = await renderScan();
    expect(view.getByText(STRINGS.connect.permissionTitle)).toBeTruthy();
    await press(view, STRINGS.connect.permissionContinue);
    expect(useAppSettingsStore.getState().blePromptSeen).toBe(true);
    expect(view.getByText(STRINGS.connect.scanning)).toBeTruthy();
  });

  it("lists the dashes it finds with the last used first", async () => {
    const view = await renderScan();
    await press(view, STRINGS.connect.scan);
    await act(() => {
      mockFound({ id: "dash-b", name: "CANShift-91C0", rssi: -80 });
      mockFound({ id: "dash-a", name: "CANShift-4F2A", rssi: -50 });
    });
    expect(view.getByText(STRINGS.connect.foundTitle)).toBeTruthy();
    expect(
      view.getByLabelText(
        `CANShift-4F2A, ${STRINGS.connect.lastUsed} · ${STRINGS.connect.signalStrong}`,
      ),
    ).toBeTruthy();
    expect(
      view.getByLabelText(`CANShift-91C0, ${STRINGS.connect.signalWeak}`),
    ).toBeTruthy();
  });

  it("connects on tap and shows the pairing sheet meanwhile", async () => {
    mockConnect.mockImplementationOnce(() => new Promise(() => undefined));
    const view = await renderScan();
    await press(view, STRINGS.connect.scan);
    await act(() => {
      mockFound({ id: "dash-a", name: "CANShift-4F2A", rssi: -50 });
    });
    await press(
      view,
      `CANShift-4F2A, ${STRINGS.connect.lastUsed} · ${STRINGS.connect.signalStrong}`,
    );
    expect(mockConnect).toHaveBeenCalledWith("dash-a");
    expect(view.getByText(STRINGS.connect.pairingTitle)).toBeTruthy();
  });

  it("shows each found dash as a blip on the radar that connects on tap", async () => {
    mockConnect.mockImplementationOnce(() => new Promise(() => undefined));
    const view = await renderScan();
    await press(view, STRINGS.connect.scan);
    await act(() => {
      mockFound({ id: "dash-b", name: "CANShift-91C0", rssi: -80 });
      mockFound({ id: "dash-a", name: "CANShift-4F2A", rssi: -50 });
    });
    expect(view.getByLabelText("CANShift-4F2A")).toBeTruthy();
    await press(view, "CANShift-91C0");
    expect(mockConnect).toHaveBeenCalledWith("dash-b");
  });

  it("shows the denied state with Open Settings", async () => {
    mockPermission = { kind: "unauthorized", platform: "ios" };
    const view = await renderScan();
    await press(view, STRINGS.connect.scan);
    expect(view.getByText(STRINGS.connect.deniedTitle)).toBeTruthy();
    expect(view.getByLabelText(STRINGS.connect.openSettings)).toBeTruthy();
  });

  it("tries the last dash first and lets you cancel", async () => {
    useDeviceStore.setState({ lastDashName: "CANShift-4F2A" });
    useReconnectStore.getState().start("dash-a", 5);
    const view = await renderScan();
    expect(
      view.getByText(STRINGS.connect.reconnectingTo("CANShift-4F2A")),
    ).toBeTruthy();
    expect(view.getByText(STRINGS.connect.reconnectingHint)).toBeTruthy();
  });

  it("starts the demo and opens the tabs", async () => {
    const view = await renderScan();
    await press(view, STRINGS.connect.tryDemo);
    expect(mockSimStart).toHaveBeenCalled();
    expect(navigation.replace).toHaveBeenCalledWith("Connected");
  });

  it("opens app info from the (i) button", async () => {
    const view = await renderScan();
    await press(view, STRINGS.connect.appInfo);
    expect(navigation.navigate).toHaveBeenCalledWith("Device");
  });
});
