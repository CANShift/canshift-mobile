import { dashFilterFor, filterKey } from "./can-id-filter";

describe("dash CAN filter", () => {
  it.each([
    [
      "a complete standard id",
      "3e0",
      [{ id: 0x3e0, extended: false, mask: 0x7ff }],
    ],
    [
      "a hex-prefixed id",
      "0x360",
      [{ id: 0x360, extended: false, mask: 0x7ff }],
    ],
    [
      "a complete extended id",
      "18FF50E5",
      [{ id: 0x18ff50e5, extended: true, mask: 0x1fffffff }],
    ],
  ])("filters on the dash for %s", (_name, text, expected) => {
    expect(dashFilterFor(text)).toEqual(expected);
  });

  it.each([
    ["an id prefix", "3E"],
    ["a standard id past 11 bits", "800"],
    ["an extended id past 29 bits", "3FFFFFFF"],
    ["data bytes", "0D 7A"],
    ["nothing", ""],
    ["text that is not hex", "rpm"],
  ])("leaves %s to the phone", (_name, text) => {
    expect(dashFilterFor(text)).toEqual([]);
  });

  it("keys a filter by what it admits", () => {
    expect(filterKey(dashFilterFor("3E0"))).toBe(
      filterKey(dashFilterFor("0x3e0")),
    );
    expect(filterKey([])).toBe("");
  });
});
