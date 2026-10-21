import {
  clearAll,
  pushSample,
  recordLap,
  startSession,
} from "../stores/track-session.store";
import {
  MIN_SAVED_TRACE_POINTS,
  finishedGpsSession,
} from "./gps-session-recorder";

const drive = (count: number, fromT: number): void => {
  for (let i = 0; i < count; i += 1)
    pushSample({
      t: fromT + i * 200,
      lat: 47 + i / 10_000,
      lng: 4,
      speedMs: 20 + i,
      headingDeg: 0,
    });
};

describe("finishedGpsSession", () => {
  beforeEach(() => {
    clearAll();
  });

  it("captures the laps, top speed and trace of the current run only", () => {
    drive(5, 0);
    startSession(10_000);
    drive(12, 10_000);
    recordLap(10_000, 100_000);

    const session = finishedGpsSession();

    expect(session?.key).toBe("g-10000");
    expect(session?.startedAt).toBe(10_000);
    expect(session?.laps).toHaveLength(1);
    expect(session?.maxSpeedMs).toBe(31);
    expect(session?.trace).toHaveLength(12);
    expect(session?.trace[0]?.t).toBe(10_000);
  });

  it("keeps a lapless run once it has a usable trace", () => {
    startSession(0);
    drive(MIN_SAVED_TRACE_POINTS, 0);
    expect(finishedGpsSession()).not.toBeNull();
  });

  it("skips a run with no lap and almost no trace", () => {
    startSession(0);
    drive(MIN_SAVED_TRACE_POINTS - 1, 0);
    expect(finishedGpsSession()).toBeNull();
  });
});
