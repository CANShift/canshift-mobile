import type { TracePoint } from "../services/gps-session-storage";
import { bestLapMs, type TimedLap } from "./lap-deltas";
import { formatChrono } from "./lap-time";

const XML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

const escapeXml = (text: string): string =>
  text.replace(/[&<>"']/g, (char) => XML_ENTITIES[char] ?? char);

const trackPoint = (point: TracePoint): string =>
  `<trkpt lat="${String(point.lat)}" lon="${String(point.lng)}"><time>${new Date(point.t).toISOString()}</time></trkpt>`;

export const buildGpx = (name: string, trace: readonly TracePoint[]): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="CANShift" xmlns="http://www.topografix.com/GPX/1/1">',
    `<trk><name>${escapeXml(name)}</name><trkseg>`,
    ...trace.map(trackPoint),
    "</trkseg></trk>",
    "</gpx>",
  ].join("\n");

export const buildLapsCsv = (laps: readonly TimedLap[]): string => {
  const best = bestLapMs(laps) ?? 0;
  const rows = laps.map((lap) =>
    [lap.number, lap.ms, formatChrono(lap.ms), lap.ms - best].join(","),
  );
  return ["lap,lap_ms,lap_time,delta_to_best_ms", ...rows].join("\n");
};

export const exportFileName = (startedAt: number, extension: string): string =>
  `canshift-session-${new Date(startedAt).toISOString().slice(0, 16).replace(/[:T]/g, "-")}.${extension}`;
