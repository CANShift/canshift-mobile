import type { LineSegment } from "@canshift/core/track";
import type { SavedCircuit } from "../services/circuit-storage";

export const CIRCUIT_MATCH_RADIUS_M = 2000;

const METERS_PER_DEG_LAT = 111_320;

type GeoPoint = LineSegment["a"];

const lineMidpoint = ({ a, b }: LineSegment): GeoPoint => ({
  lat: (a.lat + b.lat) / 2,
  lng: (a.lng + b.lng) / 2,
});

export const metersBetween = (from: GeoPoint, to: GeoPoint): number => {
  const meanLatRad = (((from.lat + to.lat) / 2) * Math.PI) / 180;
  const northM = (to.lat - from.lat) * METERS_PER_DEG_LAT;
  const eastM = (to.lng - from.lng) * METERS_PER_DEG_LAT * Math.cos(meanLatRad);
  return Math.hypot(northM, eastM);
};

const distanceTo =
  (position: GeoPoint) =>
  (circuit: SavedCircuit): number =>
    metersBetween(position, lineMidpoint(circuit.line));

export const nearestCircuit = (
  circuits: readonly SavedCircuit[],
  position: GeoPoint | undefined,
): SavedCircuit | null => {
  if (position === undefined) return null;
  const distance = distanceTo(position);
  const inRange = circuits.filter(
    (circuit) => distance(circuit) <= CIRCUIT_MATCH_RADIUS_M,
  );
  return inRange.reduce<SavedCircuit | null>(
    (best, circuit) =>
      best === null || distance(circuit) < distance(best) ? circuit : best,
    null,
  );
};
