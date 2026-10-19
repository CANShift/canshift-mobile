import {
  SHIFT_LIGHT,
  sensorDefaultRange,
  shiftLightLitSegments,
} from "@canshift/core/widget-metrics";

const SHIFT_FULL_RPM = sensorDefaultRange("rpm").max;
const GREEN_CELLS = 6;
const ORANGE_CELLS = 3;

export type ShiftZone = "green" | "orange" | "red";

export const SHIFT_CELL_INDEXES: readonly number[] = Array.from(
  { length: SHIFT_LIGHT.segments },
  (_, index) => index,
);

export const shiftLitCount = (rpm: number): number =>
  shiftLightLitSegments(rpm, SHIFT_LIGHT.defaultStartRpm, SHIFT_FULL_RPM);

export const shiftCellZone = (index: number): ShiftZone => {
  if (index < GREEN_CELLS) return "green";
  return index < GREEN_CELLS + ORANGE_CELLS ? "orange" : "red";
};
