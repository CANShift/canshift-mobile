import * as React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LogScreen from "./LogScreen";
import {
  DEFAULT_CAN_ID_RANGE,
  useCanFilterStore,
} from "../stores/can-filter.store";

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <LogScreen onBack={jest.fn()} />
    </SafeAreaProvider>,
  );

beforeEach(() => {
  useCanFilterStore.setState({ range: DEFAULT_CAN_ID_RANGE });
});

describe("LogScreen — empty CAN console", () => {
  it("states the cause over three lines and the active filter", async () => {
    const { getByText } = await renderScreen();
    expect(
      getByText(
        "NO FRAMES YET.\nTHE BUS IS QUIET OR THE\nFILTER IS TOO NARROW.",
      ),
    ).toBeTruthy();
    expect(getByText("Filter: ID 0x2C0 – 0x2CF")).toBeTruthy();
  });

  it("keeps the three tabs reachable while the console is empty", async () => {
    const { getByRole, getByLabelText } = await renderScreen();
    expect(getByRole("tab", { name: "CAN", selected: true })).toBeTruthy();
    await fireEvent.press(getByLabelText("Send"));
    expect(getByRole("tab", { name: "Send", selected: true })).toBeTruthy();
  });

  it("clears the filter and restates the cause without it", async () => {
    const { getByLabelText, queryByLabelText, getByText } =
      await renderScreen();
    await fireEvent.press(getByLabelText("CLEAR FILTER"));
    expect(useCanFilterStore.getState().range).toBeNull();
    expect(queryByLabelText("CLEAR FILTER")).toBeNull();
    expect(getByText("NO FRAMES YET.\nTHE BUS IS QUIET.")).toBeTruthy();
    expect(getByText("Filter: none")).toBeTruthy();
  });
});
