import * as React from "react";
import { render } from "@testing-library/react-native";
import { KeepAwakeWhileLinked } from "./KeepAwakeWhileLinked";
import { useAppSettingsStore } from "../../stores/app-settings.store";
import { useDeviceStore } from "../../stores/device.store";
import { clearAll, startSession } from "../../stores/track-session.store";

const mockUseKeepAwake = jest.fn();

jest.mock("expo-keep-awake", () => ({
  useKeepAwake: (tag: string) => {
    mockUseKeepAwake(tag);
  },
}));

describe("KeepAwakeWhileLinked", () => {
  beforeEach(() => {
    clearAll();
    useDeviceStore.getState().disconnect();
    useAppSettingsStore.setState({ keepScreenOn: false });
    mockUseKeepAwake.mockClear();
  });

  it("lets the screen sleep with no dash and no timing", async () => {
    await render(<KeepAwakeWhileLinked />);
    expect(mockUseKeepAwake).not.toHaveBeenCalled();
  });

  it("keeps the screen awake while GPS timing records", async () => {
    startSession(1000);
    await render(<KeepAwakeWhileLinked />);
    expect(mockUseKeepAwake).toHaveBeenCalled();
  });
});
