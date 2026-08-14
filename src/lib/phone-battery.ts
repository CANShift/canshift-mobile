export const LOGGING_CUTOFF_PERCENT = 5;

export const LOW_BATTERY_PERCENT = 20;

export type PhoneBatteryStatus = "ok" | "low" | "cutoff";

export const toBatteryPercent = (fraction: number): number | null => {
  if (!Number.isFinite(fraction) || fraction < 0) return null;
  return Math.round(Math.min(1, fraction) * 100);
};

export const phoneBatteryStatus = (
  percent: number | null,
): PhoneBatteryStatus => {
  if (percent === null) return "ok";
  if (percent < LOGGING_CUTOFF_PERCENT) return "cutoff";
  if (percent <= LOW_BATTERY_PERCENT) return "low";
  return "ok";
};

export const isPhoneBatteryLow = (percent: number | null): boolean =>
  phoneBatteryStatus(percent) !== "ok";
