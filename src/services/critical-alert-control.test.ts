import { criticalAlertControl, ALERT_ACK_CMD } from "./critical-alert-control";
import { useDeviceStore } from "../stores/device.store";
import { useCriticalAlertStore } from "../stores/critical-alert.store";

const mockSendCmd = jest.fn(
  (_cmd: string, _payload?: Record<string, unknown>) => Promise.resolve(),
);

jest.mock("./ble.service", () => ({
  sendCmd: (cmd: string, payload?: Record<string, unknown>) =>
    mockSendCmd(cmd, payload),
}));

const initialDeviceState = useDeviceStore.getState();
const initialAlertState = useCriticalAlertStore.getState();

describe("criticalAlertControl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDeviceStore.setState(initialDeviceState, true);
    useCriticalAlertStore.setState(initialAlertState, true);
  });

  const connectDevice = (): void => {
    useDeviceStore.setState({ connectionState: "connected", mode: "ble" });
  };

  it("carries the acknowledgement to the dash", () => {
    connectDevice();
    criticalAlertControl.acknowledge("op");
    expect(mockSendCmd).toHaveBeenCalledWith(ALERT_ACK_CMD, { signal: "op" });
    expect(useCriticalAlertStore.getState().acknowledgedKey).toBe("op");
  });

  it("acknowledges locally when no device drives the alert", () => {
    criticalAlertControl.acknowledge("ct");
    expect(mockSendCmd).not.toHaveBeenCalled();
    expect(useCriticalAlertStore.getState().acknowledgedKey).toBe("ct");
  });

  it("keeps the local acknowledgement when the write fails", () => {
    connectDevice();
    mockSendCmd.mockReturnValueOnce(Promise.reject(new Error("gatt")));
    criticalAlertControl.acknowledge("op");
    expect(useCriticalAlertStore.getState().acknowledgedKey).toBe("op");
  });

  it("mutes the signal for this session without telling the dash", () => {
    connectDevice();
    criticalAlertControl.mute("ot");
    expect(mockSendCmd).not.toHaveBeenCalled();
    expect(useCriticalAlertStore.getState().mutedKeys).toEqual(["ot"]);
    expect(useCriticalAlertStore.getState().acknowledgedKey).toBeNull();
  });

  it("drops the mute list when the session resets", () => {
    criticalAlertControl.mute("ot");
    useCriticalAlertStore.getState().reset();
    expect(useCriticalAlertStore.getState().mutedKeys).toEqual([]);
  });
});
