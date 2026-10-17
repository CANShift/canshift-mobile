import { alertActions } from "./alert-actions";
import { builtInOrigin } from "../lib/alert-model";
import { useAlertsStore } from "../stores/alerts.store";
import { useDeviceStore } from "../stores/device.store";

const mockSendCmd = jest.fn(
  (_cmd: string, _payload?: Record<string, unknown>) => Promise.resolve(),
);

jest.mock("./ble.service", () => ({
  sendCmd: (cmd: string, payload?: Record<string, unknown>) =>
    mockSendCmd(cmd, payload),
}));

const initialDevice = useDeviceStore.getState();

describe("alert actions", () => {
  beforeEach(() => {
    mockSendCmd.mockClear();
    useDeviceStore.setState(initialDevice, true);
    useAlertsStore.setState({
      feed: "dash",
      active: [],
      acknowledged: [],
      muted: [],
    });
  });

  it("acknowledges one source on the phone and on the dash", () => {
    useDeviceStore.setState({ connectionState: "connected", mode: "ble" });
    alertActions.acknowledge({
      key: "coolant_temp",
      origin: builtInOrigin("coolant_temp"),
    });
    expect(useAlertsStore.getState().acknowledged).toEqual(["coolant_temp"]);
    expect(mockSendCmd).toHaveBeenCalledWith("ack_alert", { source: 1 });
  });

  it("acknowledges locally only in demo mode", () => {
    useDeviceStore.setState({ connectionState: "connected", mode: "sim" });
    alertActions.acknowledge({
      key: "oil_pressure",
      origin: builtInOrigin("oil_pressure"),
    });
    expect(mockSendCmd).not.toHaveBeenCalled();
  });

  it("acknowledges one configured entry by its own wire id", () => {
    useDeviceStore.setState({ connectionState: "connected", mode: "ble" });
    alertActions.acknowledge({
      key: "configured:2",
      origin: { source: "configured", configuredIndex: 2 },
    });
    expect(useAlertsStore.getState().acknowledged).toEqual(["configured:2"]);
    expect(mockSendCmd).toHaveBeenCalledWith("ack_alert", { source: 9 });
  });

  it("mutes several sources at once and unmutes one", () => {
    alertActions.muteAll(["oil_pressure", "coolant_temp"]);
    alertActions.unmute("oil_pressure");
    expect(useAlertsStore.getState().muted).toEqual(["coolant_temp"]);
  });
});
