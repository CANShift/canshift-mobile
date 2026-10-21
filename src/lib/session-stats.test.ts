import { sessionStats } from "./session-stats";

describe("sessionStats", () => {
  it("reports nothing timed for an empty session", () => {
    expect(sessionStats([])).toEqual({
      lapCount: 0,
      bestMs: null,
      averageMs: null,
      spreadMs: null,
    });
  });

  it("leaves the spread empty with a single lap", () => {
    expect(sessionStats([{ number: 1, ms: 90_000 }])).toEqual({
      lapCount: 1,
      bestMs: 90_000,
      averageMs: 90_000,
      spreadMs: null,
    });
  });

  it("computes best, average and the standard deviation as spread", () => {
    const stats = sessionStats([
      { number: 1, ms: 92_000 },
      { number: 2, ms: 90_000 },
      { number: 3, ms: 94_000 },
      { number: 4, ms: 92_000 },
    ]);
    expect(stats.bestMs).toBe(90_000);
    expect(stats.averageMs).toBe(92_000);
    expect(stats.spreadMs).toBeCloseTo(Math.sqrt(2_000_000));
  });
});
