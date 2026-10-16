import { ChartSeriesColors } from "../theme/ui-tokens";
import {
  MAX_GRAPH_SIGNALS,
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

  it("never plots more signals than there are series colours", () => {
    const full = ["r", "op", "ct", "ot"] as const;
    expect(MAX_GRAPH_SIGNALS).toBe(ChartSeriesColors.length);
    expect(toggleSignal(full, "bat")).toEqual([...full]);
  });

  it("dashes the third series so it reads without colour", () => {
    expect(seriesStyle(2).dashed).toBe(true);
    expect(seriesStyle(0)).toEqual({
      color: ChartSeriesColors[0],
      dashed: false,
    });
  });

  it("searches signals by name, ignoring case and spaces", () => {
    expect(matchingSignals(" oil ")).toEqual(["ot", "op"]);
    expect(matchingSignals("").length).toBeGreaterThan(10);
  });
});
