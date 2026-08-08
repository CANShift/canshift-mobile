import * as React from "react";
import { render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DeviceScreen from "./DeviceScreen";
import type { RootStackParamList } from "../navigation";

const navigation = {
  goBack: jest.fn(),
  replace: jest.fn(),
} as unknown as NativeStackNavigationProp<RootStackParamList, "Device">;

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <DeviceScreen navigation={navigation} />
    </SafeAreaProvider>,
  );

describe("DeviceScreen", () => {
  it("renders the device and application facts", () => {
    const { getByText } = renderScreen();
    expect(getByText("DEVICE")).toBeTruthy();
    expect(getByText("Config schema")).toBeTruthy();
    expect(getByText("Firmware")).toBeTruthy();
  });

  it("hides the disconnect action when not connected", () => {
    const { queryByLabelText } = renderScreen();
    expect(queryByLabelText("Disconnect")).toBeNull();
    expect(queryByLabelText("End demo")).toBeNull();
  });
});
