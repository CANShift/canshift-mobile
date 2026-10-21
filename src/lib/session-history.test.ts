import { historySessions } from "./session-history";
import { statTiles } from "./session-view";
import { HISTORY_STRINGS } from "../history-strings";

const gpsSession = {
  key: "g-200",
  startedAt: 200,
  label: "",
  laps: [{ number: 1, startMs: 200, endMs: 90_200, durationMs: 90_000 }],
  maxSpeedMs: 50,
  trace: [],
};

const timerSession = {
  key: "s-100-1",
  startedAt: 100,
  label: "Heat 1",
  laps: [{ index: 1, lapMs: 95_000, totalMs: 95_000 }],
};

describe("historySessions", () => {
  it("merges both sources newest first with their laps as timed laps", () => {
    const sessions = historySessions([gpsSession], [timerSession]);
    expect(sessions.map((s) => [s.key, s.source])).toEqual([
      ["g-200", "gps"],
      ["s-100-1", "timer"],
    ]);
    expect(sessions[0]?.laps).toEqual([{ number: 1, ms: 90_000 }]);
    expect(sessions[1]?.laps).toEqual([{ number: 1, ms: 95_000 }]);
    expect(sessions[1]?.maxSpeedMs).toBeNull();
  });
});

describe("statTiles", () => {
  it("shows top speed for GPS sessions only", () => {
    const [gps, timer] = historySessions([gpsSession], [timerSession]);
    if (gps === undefined || timer === undefined) throw new Error("missing");
    const labels = (tiles: ReturnType<typeof statTiles>) =>
      tiles.map((tile) => tile.label);
    expect(labels(statTiles(gps))).toContain(HISTORY_STRINGS.topSpeed);
    expect(labels(statTiles(timer))).not.toContain(HISTORY_STRINGS.topSpeed);
    expect(statTiles(gps).at(-1)?.value).toBe(HISTORY_STRINGS.kmh(180));
  });
});
