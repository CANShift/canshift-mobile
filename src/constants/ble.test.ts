import { TELEMETRY_FIELDS } from "@canshift/core/wire";
import { SIGNAL_META } from "./ble";

describe("SIGNAL_META", () => {
  it("lists the TELE fields in the order the dash sends them", () => {
    expect(Object.keys(SIGNAL_META)).toEqual([...TELEMETRY_FIELDS]);
  });
});
