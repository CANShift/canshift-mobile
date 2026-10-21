import { HISTORY_STRINGS } from "../history-strings";
import {
  deleteGpsSession,
  renameGpsSession,
  useGpsSessionsStore,
} from "../stores/gps-sessions.store";
import {
  deleteTimerSession,
  renameTimerSession,
} from "../stores/timer-sessions.store";
import type { HistorySession, SessionSource } from "../lib/session-history";
import { buildGpx, buildLapsCsv, exportFileName } from "../lib/session-export";
import { sessionTitle } from "../lib/session-view";
import { reportFailure } from "../lib/report-dash-failure";
import { shareTextFile } from "./share-file";

export type ExportKind = "gpx" | "csv";

interface ExportFormat {
  label: string;
  extension: string;
  build: (session: HistorySession) => string;
}

const gpsTrace = (key: string) =>
  useGpsSessionsStore.getState().sessions.find((s) => s.key === key)?.trace ??
  [];

const EXPORT_FORMATS: Record<ExportKind, ExportFormat> = {
  gpx: {
    label: HISTORY_STRINGS.exportGpx,
    extension: "gpx",
    build: (session) => buildGpx(sessionTitle(session), gpsTrace(session.key)),
  },
  csv: {
    label: HISTORY_STRINGS.exportCsv,
    extension: "csv",
    build: (session) => buildLapsCsv(session.laps),
  },
};

export const EXPORTS_BY_SOURCE: Record<SessionSource, readonly ExportKind[]> = {
  gps: ["gpx", "csv"],
  timer: ["csv"],
};

export const exportLabel = (kind: ExportKind): string =>
  EXPORT_FORMATS[kind].label;

export const exportSession = async (
  session: HistorySession,
  kind: ExportKind,
): Promise<void> => {
  const format = EXPORT_FORMATS[kind];
  try {
    await shareTextFile(
      exportFileName(session.startedAt, format.extension),
      format.build(session),
      HISTORY_STRINGS.exportTitle,
    );
  } catch (err) {
    reportFailure("Session export", err, HISTORY_STRINGS.exportFailed);
  }
};

interface SourceOps {
  rename: (key: string, label: string) => void;
  remove: (key: string) => void;
}

const SOURCE_OPS: Record<SessionSource, SourceOps> = {
  gps: {
    rename: (key, label) => void renameGpsSession(key, label),
    remove: (key) => void deleteGpsSession(key),
  },
  timer: { rename: renameTimerSession, remove: deleteTimerSession },
};

export const renameSession = (session: HistorySession, label: string): void => {
  SOURCE_OPS[session.source].rename(session.key, label);
};

export const deleteSession = (session: HistorySession): void => {
  SOURCE_OPS[session.source].remove(session.key);
};
