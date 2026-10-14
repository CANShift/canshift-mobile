import {
  SHIFT_LIGHT,
  sensorDefaultRange,
  shiftLightLitSegments,
} from "@canshift/core";

const SHIFT_FULL_RPM = sensorDefaultRange("rpm").max;

export const SHIFT_CELL_INDEXES: readonly number[] = Array.from(
  { length: SHIFT_LIGHT.segments },
  (_, index) => index,
);

export const shiftLitCount = (rpm: number): number =>
  shiftLightLitSegments(rpm, SHIFT_LIGHT.defaultStartRpm, SHIFT_FULL_RPM);

export const isRedShiftCell = (index: number): boolean =>
  index >= SHIFT_LIGHT.segments - SHIFT_LIGHT.defaultRedSegments;
