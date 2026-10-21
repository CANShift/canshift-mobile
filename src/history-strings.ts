import { plural } from "./strings";

export const HISTORY_STRINGS = {
  open: "History",
  title: "Sessions",
  detailTitle: "Session",
  backToLaps: "Laps",
  backToSessions: "Sessions",
  emptyTitle: "No sessions yet",
  emptyBody: "Finished GPS runs and dash-timer laps show up here.",
  sourceGps: "GPS",
  sourceTimer: "DASH TIMER",
  lapCount: (laps: number): string => plural(laps, "lap", "laps"),
  bestShort: (time: string): string => `Best ${time}`,
  noLaps: "No laps",
  labelField: "Session name",
  labelPlaceholder: "Name this session",
  best: "Best",
  average: "Average",
  consistency: "Spread",
  topSpeed: "Top speed",
  plusMinusSeconds: (seconds: string): string => `±${seconds} s`,
  kmh: (kmh: number): string => `${String(kmh)} km/h`,
  exportGpx: "Export GPX",
  exportCsv: "Export CSV",
  exportTitle: "CANShift session",
  exportFailed: "Couldn’t export the session. Try again.",
  deleteSession: "Delete session…",
  deleteTitle: "Delete this session?",
  deleteBody: (laps: number): string =>
    `${plural(laps, "lap", "laps")} and the recorded data will be removed from this phone.`,
  delete: "Delete",
  cancel: "Cancel",
  readFailed:
    "Saved sessions couldn’t be read. New sessions are still kept until you close the app.",
  writeFailed:
    "Sessions can’t be saved: the phone is out of storage. They stay until you close the app.",
} as const;
