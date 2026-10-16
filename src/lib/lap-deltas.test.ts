import { bestLapMs, lapLines, lastVsBest } from "./lap-deltas";
import { formatChrono, formatDelta } from "./lap-time";

const LAPS = [
  { number: 1, ms: 74_070 },
  { number: 2, ms: 71_900 },
  { number: 3, ms: 72_320 },
];

describe("lap deltas", () => {
  it("formats a chrono in minutes, seconds and hundredths", () => {
    expect(formatChrono(72_484)).toBe("1:12.48");
    expect(formatChrono(0)).toBe("0:00.00");
  });

  it("signs a delta with a real minus", () => {
    expect(formatDelta(420)).toBe("+0.42");
    expect(formatDelta(-2_170)).toBe("−2.17");
  });

  it("lists laps newest first with BEST and deltas to the best", () => {
    expect(
      lapLines(LAPS).map((line) => [line.label, line.time, line.delta]),
    ).toEqual([
      ["Lap 3", "1:12.32", "+0.42"],
      ["Lap 2", "1:11.90", "BEST"],
      ["Lap 1", "1:14.07", "+2.17"],
    ]);
  });

  it("compares the last lap to the best once there are two", () => {
    expect(bestLapMs(LAPS)).toBe(71_900);
    expect(lastVsBest(LAPS)).toBe(420);
    expect(lastVsBest(LAPS.slice(0, 1))).toBeNull();
  });
});
