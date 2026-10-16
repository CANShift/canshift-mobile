import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { act, fireEvent, render } from "@testing-library/react-native";
import GraphScreen from "./GraphScreen";
import {
  clearBuffer,
  getWriteIndex,
  pushSample,
} from "../stores/telemetry.store";
import { STRINGS } from "../strings";

const mockExport = jest.fn((..._args: unknown[]) => Promise.resolve());

jest.mock("../services/graph-export", () => ({
  exportGraphCsv: (...args: unknown[]) => mockExport(...args),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderGraph = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <NavigationContainer>
        <GraphScreen />
      </NavigationContainer>
    </SafeAreaProvider>,
  );

const fillBuffer = (): void => {
  pushSample({ r: 3000, op: 3.8, ct: 90 });
  pushSample({ r: 3200, op: 3.9, ct: 91 });
};

type View = Awaited<ReturnType<typeof renderGraph>>;

const press = async (view: View, label: string) => {
  await act(() => {
    void fireEvent.press(view.getByLabelText(label));
  });
};

describe("Graph screen", () => {
  beforeEach(() => {
    clearBuffer();
    mockExport.mockClear();
  });

  it("explains the empty state and disables the actions", async () => {
    const view = await renderGraph();
    expect(view.getByText(STRINGS.graph.emptyTitle)).toBeTruthy();
    expect(
      view.getByLabelText(STRINGS.graph.pause).props.accessibilityState,
    ).toMatchObject({ disabled: true });
  });

  it("charts the default signals with their latest values", async () => {
    fillBuffer();
    const view = await renderGraph();
    expect(
      view.getByLabelText(
        STRINGS.graph.chartLabel("RPM, Oil Pressure, Coolant", "1 min"),
      ),
    ).toBeTruthy();
    expect(view.getByText("3200")).toBeTruthy();
  });

  it("removes a signal from its chip", async () => {
    fillBuffer();
    const view = await renderGraph();
    await press(view, STRINGS.graph.removeSignal("Coolant"));
    expect(
      view.queryByLabelText(STRINGS.graph.removeSignal("Coolant")),
    ).toBeNull();
  });

  it("caps the picker at four signals", async () => {
    const view = await renderGraph();
    await press(view, STRINGS.graph.addSignal);
    expect(view.getByText(STRINGS.graph.pickerCount(3, 4))).toBeTruthy();
    await press(view, "Oil Temp");
    expect(view.getByText(STRINGS.graph.pickerCount(4, 4))).toBeTruthy();
    expect(
      view.getByLabelText("Battery").props.accessibilityState,
    ).toMatchObject({ disabled: true });
  });

  it("shows PAUSED while paused", async () => {
    fillBuffer();
    const view = await renderGraph();
    await press(view, STRINGS.graph.pause);
    expect(view.getByText(STRINGS.graph.paused)).toBeTruthy();
    expect(view.getByLabelText(STRINGS.graph.resume)).toBeTruthy();
  });

  it("clears only after confirmation", async () => {
    fillBuffer();
    const view = await renderGraph();
    await press(view, STRINGS.graph.clear);
    expect(view.getByText(STRINGS.graph.clearTitle)).toBeTruthy();
    expect(getWriteIndex()).toBe(2);
    const [, confirm] = view.getAllByLabelText(STRINGS.graph.clear);
    if (confirm === undefined) throw new Error("no confirm button");
    await act(() => {
      void fireEvent.press(confirm);
    });
    expect(getWriteIndex()).toBe(0);
  });

  it("exports the visible window after confirmation", async () => {
    fillBuffer();
    const view = await renderGraph();
    await press(view, STRINGS.graph.export);
    expect(view.getByText(STRINGS.graph.exportBody("1 min"))).toBeTruthy();
    await press(view, STRINGS.graph.share);
    expect(mockExport).toHaveBeenCalledWith(expect.any(Array), [
      "r",
      "op",
      "ct",
    ]);
  });
});
