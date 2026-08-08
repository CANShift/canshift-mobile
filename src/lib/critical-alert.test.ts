import { sensorDefaultDangerThreshold } from "@canshift/core";
import { selectCriticalAlert } from "./critical-alert";

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
