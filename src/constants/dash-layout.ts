import type { SignalKey } from "./ble";

export const PRIMARY_SIGNALS: SignalKey[] = ["r", "s", "g"];

export const GRID_SIGNALS: SignalKey[] = [
  "ct",
  "ot",
  "op",
  "tps",
  "lam",
  "bat",
  "bst",
  "iat",
];

export const SAFETY_SIGNALS: SignalKey[] = ["op", "ct"];

export const GAUGE_SIZE_PORTRAIT = 132;
export const GAUGE_SIZE_LANDSCAPE = 116;
export const GRID_CELL_HEIGHT = 88;
export const GRID_CELL_HEIGHT_LANDSCAPE = 82;
export const GRID_CELL_WIDTH_LANDSCAPE = 150;
export const PORTRAIT_GRID_COLUMNS = 2;
export const WARNING_CELL_SIZE = 48;
export const TIMER_WIDTH = 132;
export const TIMER_HEIGHT = 56;
