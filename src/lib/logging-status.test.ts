import { formatElapsed } from "./logging-status";

describe("formatElapsed", () => {
  it("shows minutes and seconds of logging", () => {
    expect(formatElapsed(252_000)).toBe("04:12");
    expect(formatElapsed(0)).toBe("00:00");
  });

  it("never goes negative", () => {
    expect(formatElapsed(-5_000)).toBe("00:00");
  });
});
