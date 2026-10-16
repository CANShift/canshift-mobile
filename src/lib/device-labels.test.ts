import { firmwareLabel } from "./device-labels";

describe("firmwareLabel", () => {
  it("names the simulator ahead of the connection state", () => {
    expect(firmwareLabel(true, false, null)).toBe("Simulator");
  });

  it("prefixes a connected firmware version", () => {
    expect(firmwareLabel(false, true, "6.1.0")).toBe("v6.1.0");
  });
});
