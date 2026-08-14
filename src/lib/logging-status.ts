const MS_PER_MINUTE = 60_000;

export const LOGGING_OFF_TEXT = "OFF";

export const loggingStatusText = (
  recording: boolean,
  elapsedMs: number,
): string => {
  if (!recording) return LOGGING_OFF_TEXT;
  const minutes = Math.floor(Math.max(0, elapsedMs) / MS_PER_MINUTE);
  return `ON · ${String(minutes)} min`;
};
