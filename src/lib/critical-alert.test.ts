import { sensorDefaultDangerBand } from "@canshift/core";
import {
  MISSING_VALUE,
  criticalAlertName,
  criticalAlertRows,
  criticalAlertThreshold,
  criticalAlertValue,
  selectCriticalAlert,
} from "./critical-alert";

const CT_MAX = sensorDefaultDangerBand("coolant_temp").above ?? 0;
const OP_MIN = sensorDefaultDangerBand("oil_press").below ?? 0;
const BAT = sensorDefaultDangerBand("battery_volts");
const BAT_MIN = BAT.below ?? 0;
const BAT_MAX = BAT.above ?? 0;

const ctTrip = CT_MAX + 5;
const ctSafe = CT_MAX - 5;
const opTrip = OP_MIN - 0.5;
const opSafe = OP_MIN + 1;

const none = new Set<never>();

describe("selectCriticalAlert", () => {
  it("returns null when every critical signal is within range", () => {
    expect(selectCriticalAlert({ ct: ctSafe, op: opSafe }, none)).toBeNull();
  });

  it("returns null for an empty payload", () => {
    expect(selectCriticalAlert({}, none)).toBeNull();
  });

  it("fires on a high-side crossing (coolant temp)", () => {
    expect(selectCriticalAlert({ ct: ctTrip }, none)).toEqual({
      key: "ct",
      value: ctTrip,
    });
  });

  it("fires on a low-side crossing (oil pressure, inverted logic)", () => {
    expect(selectCriticalAlert({ op: opTrip }, none)).toEqual({
      key: "op",
      value: opTrip,
    });
  });

  it("suppresses a muted signal", () => {
    expect(selectCriticalAlert({ ct: ctTrip }, new Set(["ct"]))).toBeNull();
  });

  it("still fires an unmuted signal when another is muted", () => {
    expect(
      selectCriticalAlert({ op: opTrip, ct: ctTrip }, new Set(["op"])),
    ).toEqual({ key: "ct", value: ctTrip });
  });

  it("prioritises oil pressure over coolant when both are tripped", () => {
    expect(selectCriticalAlert({ op: opTrip, ct: ctTrip }, none)).toEqual({
      key: "op",
      value: opTrip,
    });
  });
});

describe("critical alert copy", () => {
  it("names the signal in uppercase", () => {
    expect(criticalAlertName("op")).toBe("OIL PRESSURE");
  });

  it("formats the value at the signal's precision", () => {
    expect(criticalAlertValue({ key: "op", value: 0.42 })).toBe("0.4");
  });

  it("states a low-side limit as MIN with its unit", () => {
    expect(criticalAlertThreshold({ key: "op", value: opTrip })).toBe(
      `MIN ${OP_MIN.toFixed(1)} bar`,
    );
  });

  it("states a high-side limit as MAX with its unit", () => {
    expect(criticalAlertThreshold({ key: "ct", value: ctTrip })).toBe(
      `MAX ${Math.round(CT_MAX).toString()} °C`,
    );
  });

  it("states the low side a two-sided signal crossed", () => {
    expect(criticalAlertThreshold({ key: "bat", value: BAT_MIN - 1 })).toBe(
      `MIN ${BAT_MIN.toFixed(1)} V`,
    );
  });

  it("states the high side a two-sided signal crossed", () => {
    expect(criticalAlertThreshold({ key: "bat", value: BAT_MAX })).toBe(
      `MAX ${BAT_MAX.toFixed(1)} V`,
    );
  });

  it("states both sides once the value is back inside the band", () => {
    expect(criticalAlertThreshold({ key: "bat", value: 13.8 })).toBe(
      `MIN ${BAT_MIN.toFixed(1)} V · MAX ${BAT_MAX.toFixed(1)} V`,
    );
  });

  it("falls back to a generic limit for a signal without a sensor kind", () => {
    expect(criticalAlertThreshold({ key: "tps", value: 50 })).toBe(
      "OUT OF THE SAFE RANGE",
    );
  });
});

describe("criticalAlertRows", () => {
  it("keeps RPM, OIL TEMP and SINCE in that order", () => {
    expect(criticalAlertRows({ r: 5200, ot: 128 }, 3)).toEqual([
      { label: "RPM", value: "5200" },
      { label: "OIL TEMP", value: "128 °C" },
      { label: "SINCE", value: "3 s" },
    ]);
  });

  it("holds the row when the signal has no value yet", () => {
    expect(criticalAlertRows({}, 0)).toEqual([
      { label: "RPM", value: MISSING_VALUE },
      { label: "OIL TEMP", value: MISSING_VALUE },
      { label: "SINCE", value: "0 s" },
    ]);
  });
});
