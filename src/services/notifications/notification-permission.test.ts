import { startNotificationPermission } from "./notification-permission";
import { useDeviceStore } from "../../stores/device.store";
import { useNotificationPermissionStore } from "../../stores/notification-permission.store";

interface Status {
  granted: boolean;
  canAskAgain: boolean;
}

const UNDETERMINED: Status = { granted: false, canAskAgain: true };
const GRANTED: Status = { granted: true, canAskAgain: true };
const DENIED: Status = { granted: false, canAskAgain: false };

const mockGet = jest.fn(() => Promise.resolve(UNDETERMINED));
const mockRequest = jest.fn(() => Promise.resolve(GRANTED));

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: () => mockGet(),
  requestPermissionsAsync: () => mockRequest(),
}));

const flush = () => new Promise((resolve) => setImmediate(resolve));

const linkDash = () => {
  useDeviceStore.getState().setDevice("dash", "CANShift");
  useDeviceStore.getState().setMode("ble");
};

describe("notification permission", () => {
  let stop: () => void = () => undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    useDeviceStore.getState().disconnect();
    useNotificationPermissionStore.setState({ permission: "unknown" });
  });

  afterEach(() => {
    stop();
  });

  it("doesn't ask at launch", async () => {
    stop = startNotificationPermission();
    await flush();
    expect(mockRequest).not.toHaveBeenCalled();
    expect(useNotificationPermissionStore.getState().permission).toBe(
      "undetermined",
    );
  });

  it("asks after the first dash connection", async () => {
    stop = startNotificationPermission();
    linkDash();
    await flush();
    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(useNotificationPermissionStore.getState().permission).toBe(
      "granted",
    );
  });

  it("doesn't ask for the demo", async () => {
    stop = startNotificationPermission();
    useDeviceStore.getState().setMode("sim");
    await flush();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("doesn't ask again once the phone said no", async () => {
    mockGet.mockImplementation(() => Promise.resolve(DENIED));
    stop = startNotificationPermission();
    linkDash();
    await flush();
    expect(mockRequest).not.toHaveBeenCalled();
    expect(useNotificationPermissionStore.getState().permission).toBe("denied");
  });
});
