import { signalStrength, type SignalStrength } from "./signal-strength";
import { RADAR_SIZE, SONAR_RINGS, type SonarRingName } from "./sonar-geometry";

export interface BlipPlacement {
  ring: SonarRingName;
  angleDeg: number;
  x: number;
  y: number;
}

const RING_BY_STRENGTH: Record<SignalStrength, SonarRingName> = {
  strong: "inner",
  ok: "middle",
  weak: "outer",
};

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const FULL_TURN_DEG = 360;
const START_DEG = -90;

const hashId = (id: string): number =>
  Array.from({ length: id.length }, (_, index) => id.charCodeAt(index)).reduce(
    (hash, code) => Math.imul(hash ^ code, FNV_PRIME) >>> 0,
    FNV_OFFSET,
  );

const toRadians = (deg: number): number => (deg * Math.PI) / 180;

export const blipPlacement = (
  rssi: number | null,
  id: string,
): BlipPlacement => {
  const ring = RING_BY_STRENGTH[signalStrength(rssi)];
  const angleDeg = hashId(id) % FULL_TURN_DEG;
  const radius = RADAR_SIZE / 2 - SONAR_RINGS[ring].inset;
  const theta = toRadians(START_DEG + angleDeg);
  return {
    ring,
    angleDeg,
    x: RADAR_SIZE / 2 + radius * Math.cos(theta),
    y: RADAR_SIZE / 2 + radius * Math.sin(theta),
  };
};
