const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

const pad = (value: number): string => String(value).padStart(2, "0");

export const formatElapsed = (elapsedMs: number): string => {
  const totalSeconds = Math.floor(Math.max(0, elapsedMs) / MS_PER_SECOND);
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  return `${pad(minutes)}:${pad(totalSeconds % SECONDS_PER_MINUTE)}`;
};
