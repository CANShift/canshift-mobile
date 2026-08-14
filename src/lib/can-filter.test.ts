import { canEmptyMessage, canFilterLabel } from "./can-filter";
import { DEFAULT_CAN_ID_RANGE } from "../stores/can-filter.store";

describe("canFilterLabel", () => {
  it("states the active range in hex with an en dash", () => {
    expect(canFilterLabel(DEFAULT_CAN_ID_RANGE)).toBe(
      "Filter: ID 0x2C0 – 0x2CF",
    );
  });

  it("pads ids to three hex digits", () => {
    expect(canFilterLabel({ from: 0x10, to: 0x1f })).toBe(
      "Filter: ID 0x010 – 0x01F",
    );
  });

  it("states that nothing is filtered once the filter is cleared", () => {
    expect(canFilterLabel(null)).toBe("Filter: none");
  });
});

describe("canEmptyMessage", () => {
  it("names the filter as a possible cause while one is active", () => {
    expect(canEmptyMessage(DEFAULT_CAN_ID_RANGE)).toBe(
      "NO FRAMES YET.\nTHE BUS IS QUIET OR THE\nFILTER IS TOO NARROW.",
    );
  });

  it("drops the filter clause once no filter can explain the silence", () => {
    expect(canEmptyMessage(null)).toBe("NO FRAMES YET.\nTHE BUS IS QUIET.");
  });
});
