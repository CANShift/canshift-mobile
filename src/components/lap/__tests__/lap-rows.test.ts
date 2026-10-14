import { timerLapRows, trackLapRows } from "../lap-rows";

describe("timerLapRows", () => {
  it("lists laps newest first with lap and total times", () => {
    const rows = timerLapRows([
      { index: 1, lapMs: 12_000, totalMs: 12_000 },
      { index: 2, lapMs: 11_500, totalMs: 23_500 },
    ]);
    expect(rows.map((row) => row.label)).toEqual(["Lap 2", "Lap 1"]);
    expect(rows[0]?.totalText).not.toBeNull();
  });

  it("marks the fastest lap once there are two to compare", () => {
    const rows = timerLapRows([
      { index: 1, lapMs: 12_000, totalMs: 12_000 },
      { index: 2, lapMs: 11_500, totalMs: 23_500 },
    ]);
    expect(rows.find((row) => row.isBest)?.key).toBe("2");
  });

  it("marks no best on a single lap", () => {
    const rows = timerLapRows([{ index: 1, lapMs: 12_000, totalMs: 12_000 }]);
    expect(rows.some((row) => row.isBest)).toBe(false);
  });

  it("returns no rows for no laps", () => {
    expect(timerLapRows([])).toEqual([]);
  });
});

describe("trackLapRows", () => {
  const laps = [
    { number: 1, startMs: 0, endMs: 61_250, durationMs: 61_250 },
    { number: 2, startMs: 61_250, endMs: 120_000, durationMs: 58_750 },
  ];

  it("formats GPS laps as M:SS.mmm with no total column", () => {
    const rows = trackLapRows(laps, 58_750);
    expect(rows[0]).toEqual({
      key: "2",
      label: "Lap 2",
      lapText: "0:58.750",
      totalText: null,
      isBest: true,
    });
    expect(rows[1]?.lapText).toBe("1:01.250");
  });

  it("marks the lap matching the session best", () => {
    const rows = trackLapRows(laps, 58_750);
    expect(rows.filter((row) => row.isBest).map((row) => row.key)).toEqual([
      "2",
    ]);
  });
});
