import { sensorDefaultDangerThreshold } from "@canshift/core";
import {
  MISSING_VALUE,
  criticalAlertName,
  criticalAlertRows,
  criticalAlertThreshold,
  criticalAlertValue,
  selectCriticalAlert,
} from "./critical-alert";

const CT = sensorDefaultDangerThreshold("coolant_temp");
const OP = sensorDefaultDangerThreshold("oil_press");

const ctTrip = CT.threshold + 5;
const ctSafe = CT.threshold - 5;
const opTrip = OP.threshold - 0.5;
const opSafe = OP.threshold + 1;

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
    expect(criticalAlertThreshold("op")).toBe(
      `MIN ${OP.threshold.toFixed(1)} bar`,
    );
  });

  it("states a high-side limit as MAX with its unit", () => {
    expect(criticalAlertThreshold("ct")).toBe(
      `MAX ${Math.round(CT.threshold).toString()} °C`,
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
