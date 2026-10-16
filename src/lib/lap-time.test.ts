import { formatChrono, formatDelta } from "./lap-time";

describe("formatChrono", () => {
  it("formats zero and sub-minute times in hundredths", () => {
    expect(formatChrono(0)).toBe("0:00.00");
    expect(formatChrono(45_678)).toBe("0:45.67");
  });

  it("formats laps beyond ten minutes", () => {
    expect(formatChrono(600_000)).toBe("10:00.00");
  });

  it("clamps negative input and floors fractions", () => {
    expect(formatChrono(-500)).toBe("0:00.00");
    expect(formatChrono(999.9)).toBe("0:00.99");
  });
});

describe("formatDelta", () => {
  it("rounds to hundredths and carries into seconds", () => {
    expect(formatDelta(1_995)).toBe("+2.00");
    expect(formatDelta(0)).toBe("+0.00");
  });
});
