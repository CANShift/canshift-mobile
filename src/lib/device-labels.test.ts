import { deviceRowStatus, firmwareLabel } from "./device-labels";

describe("deviceRowStatus", () => {
  it("reports the connecting device and hides its signal", () => {
    expect(deviceRowStatus(-71, true)).toEqual({
      state: "connecting",
      detail: "CONNECTING",
    });
  });

  it("reports the signal of every other device", () => {
    expect(deviceRowStatus(-71, false)).toEqual({
      state: "signal",
      detail: "-71 dBm",
    });
  });

  it("falls back to the missing-value dashes without a signal", () => {
    expect(deviceRowStatus(null, false)).toEqual({
      state: "unknown",
      detail: "- - dBm",
    });
  });
});

describe("firmwareLabel", () => {
  it("names the simulator ahead of the connection state", () => {
    expect(firmwareLabel(true, false, null)).toBe("Simulator");
  });

  it("prefixes a connected firmware version", () => {
    expect(firmwareLabel(false, true, "6.1.0")).toBe("v6.1.0");
  });
});
