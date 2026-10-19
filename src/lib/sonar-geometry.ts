import { UiColors } from "../theme/ui-tokens";

export const RADAR_SIZE = 240;
export const DOT_SIZE = 24;
export const PULSE_SIZE = 280;
export const RADAR_SCALE = { full: 1, compact: 0.45 } as const;

const RADAR_MARGIN_TOP = 16;

export interface SonarRingSpec {
  inset: number;
  color: string;
  width: number;
}

export type SonarRingName = "outer" | "middle" | "inner";

export const SONAR_RINGS: Record<SonarRingName, SonarRingSpec> = {
  outer: { inset: 0, color: UiColors.borderRow, width: 1.5 },
  middle: { inset: 40, color: UiColors.border, width: 1.5 },
  inner: { inset: 80, color: UiColors.accent, width: 2 },
};

export const SONAR_RING_ORDER: readonly SonarRingName[] = [
  "outer",
  "middle",
  "inner",
];

export const ringFrame = (ring: SonarRingSpec) => ({
  top: ring.inset,
  left: ring.inset,
  right: ring.inset,
  bottom: ring.inset,
  borderRadius: (RADAR_SIZE - ring.inset * 2) / 2,
});

export const pulseReach = (ring: SonarRingSpec): number =>
  (RADAR_SIZE / 2 - ring.inset - DOT_SIZE / 2) /
  (PULSE_SIZE / 2 - DOT_SIZE / 2);

export const centeredSquare = (size: number) => ({
  position: "absolute" as const,
  left: (RADAR_SIZE - size) / 2,
  top: (RADAR_SIZE - size) / 2,
  width: size,
  height: size,
  borderRadius: size / 2,
});

export const radarFrame = (scale: number) => ({
  width: RADAR_SIZE * scale,
  height: RADAR_SIZE * scale,
  marginTop: RADAR_MARGIN_TOP * scale,
});

export const radarLayerFrame = (scale: number) => {
  const offset = (RADAR_SIZE * (scale - 1)) / 2;
  return {
    position: "absolute" as const,
    left: offset,
    top: offset,
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    transform: [{ scale }],
  };
};
