import type { CanMonitorId } from "@canshift/core/wire";

const STANDARD_ID_DIGITS = 3;
const EXTENDED_ID_DIGITS = 8;

export const formatByte = (byte: number): string =>
  byte.toString(16).toUpperCase().padStart(2, "0");

export const formatCanId = ({ id, extended }: CanMonitorId): string =>
  id
    .toString(16)
    .toUpperCase()
    .padStart(extended ? EXTENDED_ID_DIGITS : STANDARD_ID_DIGITS, "0");

export const formatCanData = (data: readonly number[]): string =>
  data.map(formatByte).join(" ");
