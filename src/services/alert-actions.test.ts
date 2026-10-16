import { alertActions } from "./alert-actions";
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
    alertActions.acknowledge("coolant_temp");
    expect(useAlertsStore.getState().acknowledged).toEqual(["coolant_temp"]);
    expect(mockSendCmd).toHaveBeenCalledWith("ack_alert", { source: 1 });
  });

  it("acknowledges locally only in demo mode", () => {
    useDeviceStore.setState({ connectionState: "connected", mode: "sim" });
    alertActions.acknowledge("oil_pressure");
    expect(mockSendCmd).not.toHaveBeenCalled();
  });

  it("mutes several sources at once and unmutes one", () => {
    alertActions.muteAll(["oil_pressure", "coolant_temp"]);
    alertActions.unmute("oil_pressure");
    expect(useAlertsStore.getState().muted).toEqual(["coolant_temp"]);
  });
});
