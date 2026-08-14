import { loggingStatusText } from "./logging-status";

describe("loggingStatusText", () => {
  it("states the elapsed whole minutes while recording", () => {
    expect(loggingStatusText(true, 12 * 60_000)).toBe("ON · 12 min");
    expect(loggingStatusText(true, 12 * 60_000 + 59_000)).toBe("ON · 12 min");
    expect(loggingStatusText(true, 0)).toBe("ON · 0 min");
  });

  it("reads OFF when nothing is being recorded", () => {
    expect(loggingStatusText(false, 12 * 60_000)).toBe("OFF");
  });

  it("never reports negative time", () => {
    expect(loggingStatusText(true, -5_000)).toBe("ON · 0 min");
  });
});
