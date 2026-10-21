import { maxSpeedMs, thinTrace } from "./gps-trace";
import type { GpsSample } from "../stores/track-session.store";

const samples = (count: number): GpsSample[] =>
  Array.from({ length: count }, (_, i) => ({
    t: i * 200,
    lat: 47 + i / 1000,
    lng: 4,
    speedMs: i % 7,
    headingDeg: 90,
  }));

describe("thinTrace", () => {
  it("keeps every sample under the bound, without the heading", () => {
    const trace = thinTrace(samples(3), 10);
    expect(trace).toHaveLength(3);
    expect(trace[0]).toEqual({ t: 0, lat: 47, lng: 4, speedMs: 0 });
  });

  it("never keeps more points than the bound", () => {
    const trace = thinTrace(samples(9_000), 1_800);
    expect(trace.length).toBeLessThanOrEqual(1_800);
    expect(trace[0]?.t).toBe(0);
    expect(trace[1]?.t).toBe(1_000);
  });
});

describe("maxSpeedMs", () => {
  it("returns the top speed, or zero without samples", () => {
    expect(maxSpeedMs(samples(20))).toBe(6);
    expect(maxSpeedMs([])).toBe(0);
  });
});
