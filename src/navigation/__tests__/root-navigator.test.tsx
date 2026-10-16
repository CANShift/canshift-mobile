import * as React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import Navigation from "../index";

const stubScreen = (label: string) => () => <Text>{label}</Text>;

jest.mock("../../screens/ScanScreen", () => stubScreen("scan-screen"));
jest.mock("../../screens/DeviceScreen", () => stubScreen("device-screen"));
jest.mock("../../screens/ConsoleScreen", () => stubScreen("console-screen"));
jest.mock("../ConnectedNavigator", () => stubScreen("connected-navigator"));

describe("root navigator", () => {
  it("mounts and lands on the scan screen", async () => {
    const { getByText } = await render(<Navigation />);
    expect(getByText("scan-screen")).toBeTruthy();
  });
});
