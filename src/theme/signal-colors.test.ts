import { signalRampColor } from "./signal-colors";

describe("signalRampColor", () => {
  it("colours near-stoichiometric lambda green, not rich-red (scales λ to AFR)", () => {
    expect(signalRampColor("lam", 0.99)?.toUpperCase()).toBe("#44CC66");
  });

  it("colours a genuinely rich lambda red", () => {
    expect(signalRampColor("lam", 0.71)?.toUpperCase()).toBe("#CC3333");
  });

  it("returns null for a signal without a sensor ramp", () => {
    expect(signalRampColor("tps", 50)).toBeNull();
  });
});
