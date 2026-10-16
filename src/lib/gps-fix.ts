import type { GpsPermission } from "../stores/gps-fix.store";

export const GPS_READY_ACCURACY_M = 5;

export type GpsFix = "denied" | "searching" | "weak" | "ready";

export const gpsFix = (
  permission: GpsPermission,
  accuracyM: number | null,
): GpsFix => {
  if (permission === "denied") return "denied";
  if (accuracyM === null) return "searching";
  return accuracyM <= GPS_READY_ACCURACY_M ? "ready" : "weak";
};

export const fixProgress = (accuracyM: number | null): number =>
  accuracyM === null || accuracyM <= 0
    ? 0
    : Math.min(1, GPS_READY_ACCURACY_M / accuracyM);
