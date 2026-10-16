import { ChartSeriesColors } from "../theme/ui-tokens";
import {
  axisLabels,
  matchingSignals,
  seriesStyle,
  toggleSignal,
} from "./graph-config";

describe("graph config", () => {
  it("labels the axis from the window", () => {
    expect(axisLabels(60)).toEqual(["−60 s", "−30 s", "now"]);
    expect(axisLabels(120)).toEqual(["−120 s", "−60 s", "now"]);
  });

  it("adds and removes a signal", () => {
    expect(toggleSignal(["r"], "op")).toEqual(["r", "op"]);
    expect(toggleSignal(["r", "op"], "r")).toEqual(["op"]);
  });

  it("has no limit on the number of signals", () => {
    const five = toggleSignal(["r", "op", "ct", "ot"], "bat");
    expect(five).toEqual(["r", "op", "ct", "ot", "bat"]);
  });

  it("repeats the colours with a new stroke pattern so every series stays distinct", () => {
    const styles = Array.from({ length: 12 }, (_, index) => seriesStyle(index));
    const keys = styles.map(
      (style) => `${style.color}/${style.dash ?? "solid"}`,
    );
    expect(new Set(keys).size).toBe(12);
    expect(seriesStyle(4).color).toBe(ChartSeriesColors[0]);
    expect(seriesStyle(4).dash).not.toBeNull();
  });

  it("dashes the third series so it reads without colour", () => {
    expect(seriesStyle(2).dash).not.toBeNull();
    expect(seriesStyle(0)).toEqual({ color: ChartSeriesColors[0], dash: null });
  });

  it("searches signals by name, ignoring case and spaces", () => {
    expect(matchingSignals(" oil ")).toEqual(["ot", "op"]);
    expect(matchingSignals("").length).toBeGreaterThan(10);
  });
});
