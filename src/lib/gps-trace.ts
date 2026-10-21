import type { GpsSample } from "../stores/track-session.store";
import type { TracePoint } from "../services/gps-session-storage";

const MAX_TRACE_POINTS = 1800;

const toTracePoint = ({ t, lat, lng, speedMs }: GpsSample): TracePoint => ({
  t,
  lat,
  lng,
  speedMs,
});

export const thinTrace = (
  samples: readonly GpsSample[],
  maxPoints: number = MAX_TRACE_POINTS,
): TracePoint[] => {
  const stride = Math.max(1, Math.ceil(samples.length / maxPoints));
  return samples.filter((_, index) => index % stride === 0).map(toTracePoint);
};

export const maxSpeedMs = (samples: readonly GpsSample[]): number =>
  samples.reduce((max, sample) => Math.max(max, sample.speedMs), 0);
