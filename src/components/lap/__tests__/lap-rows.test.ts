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

  it("accents the fastest lap once there are two to compare", () => {
    const rows = timerLapRows([
      { index: 1, lapMs: 12_000, totalMs: 12_000 },
      { index: 2, lapMs: 11_500, totalMs: 23_500 },
    ]);
    expect(rows.map((row) => [row.key, row.tone])).toEqual([
      ["2", "accent"],
      ["1", "ink"],
    ]);
  });

  it("marks no best on a single lap", () => {
    const rows = timerLapRows([{ index: 1, lapMs: 12_000, totalMs: 12_000 }]);
    expect(rows.every((row) => row.tone === "ink")).toBe(true);
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
    const rows = trackLapRows(laps);
    expect(rows[0]).toEqual({
      key: "2",
      label: "Lap 2",
      lapText: "0:58.750",
      totalText: null,
      tone: "ink",
    });
    expect(rows[1]?.lapText).toBe("1:01.250");
  });

  it("keeps every track lap in ink, with no best highlight", () => {
    expect(trackLapRows(laps).every((row) => row.tone === "ink")).toBe(true);
  });
});
