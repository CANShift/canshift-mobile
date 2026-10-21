import { HISTORY_STRINGS } from "../history-strings";
import type { TagTone } from "../components/laps/StatusTag";
import { formatChrono } from "./lap-time";
import { NO_VALUE } from "./tile-state";
import { sessionStats } from "./session-stats";
import type { HistorySession, SessionSource } from "./session-history";
import type { StorageFailure } from "../stores/gps-sessions.store";

const MS_TO_KMH = 3.6;
const MS_PER_SECOND = 1_000;

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
};

export interface SourceTag {
  label: string;
  tone: TagTone;
}

export const SOURCE_TAGS: Record<SessionSource, SourceTag> = {
  gps: { label: HISTORY_STRINGS.sourceGps, tone: "successOutline" },
  timer: { label: HISTORY_STRINGS.sourceTimer, tone: "neutral" },
};

export interface StatTile {
  label: string;
  value: string;
}

const sessionDate = (startedAt: number): string =>
  new Date(startedAt).toLocaleString(undefined, DATE_FORMAT);

export const sessionMeta = (session: HistorySession): string =>
  `${sessionDate(session.startedAt)} · ${HISTORY_STRINGS.lapCount(session.laps.length)}`;

export const sessionTitle = (session: HistorySession): string =>
  session.label === "" ? sessionDate(session.startedAt) : session.label;

const chronoOrNone = (ms: number | null): string =>
  ms === null ? NO_VALUE : formatChrono(ms);

const spreadText = (ms: number | null): string =>
  ms === null
    ? NO_VALUE
    : HISTORY_STRINGS.plusMinusSeconds((ms / MS_PER_SECOND).toFixed(2));

export const sessionSummary = (session: HistorySession): string => {
  const { lapCount, bestMs } = sessionStats(session.laps);
  if (bestMs === null) return HISTORY_STRINGS.noLaps;
  return `${HISTORY_STRINGS.lapCount(lapCount)} · ${HISTORY_STRINGS.bestShort(formatChrono(bestMs))}`;
};

const topSpeedTiles = (maxSpeedMs: number | null): StatTile[] =>
  maxSpeedMs === null
    ? []
    : [
        {
          label: HISTORY_STRINGS.topSpeed,
          value: HISTORY_STRINGS.kmh(Math.round(maxSpeedMs * MS_TO_KMH)),
        },
      ];

export const statTiles = (session: HistorySession): StatTile[] => {
  const stats = sessionStats(session.laps);
  return [
    { label: HISTORY_STRINGS.best, value: chronoOrNone(stats.bestMs) },
    { label: HISTORY_STRINGS.average, value: chronoOrNone(stats.averageMs) },
    { label: HISTORY_STRINGS.consistency, value: spreadText(stats.spreadMs) },
    ...topSpeedTiles(session.maxSpeedMs),
  ];
};

export const STORAGE_NOTES: Record<StorageFailure, string> = {
  "set-aside": HISTORY_STRINGS.readFailedSetAside,
  kept: HISTORY_STRINGS.readFailedKept,
  write: HISTORY_STRINGS.writeFailed,
};
