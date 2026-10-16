const MS_PER_MINUTE = 60_000;
const MS_PER_SECOND = 1_000;
const MS_PER_CENTI = 10;
const CENTIS_PER_SECOND = 100;

const pad = (value: number, width: number): string =>
  String(value).padStart(width, "0");

export const formatChrono = (ms: number): string => {
  const clamped = Math.max(0, Math.floor(ms));
  const minutes = Math.floor(clamped / MS_PER_MINUTE);
  const seconds = Math.floor((clamped % MS_PER_MINUTE) / MS_PER_SECOND);
  const centis = Math.floor((clamped % MS_PER_SECOND) / MS_PER_CENTI);
  return `${String(minutes)}:${pad(seconds, 2)}.${pad(centis, 2)}`;
};

export const formatDelta = (deltaMs: number): string => {
  const sign = deltaMs < 0 ? "−" : "+";
  const centis = Math.round(Math.abs(deltaMs) / MS_PER_CENTI);
  const seconds = Math.floor(centis / CENTIS_PER_SECOND);
  return `${sign}${String(seconds)}.${pad(centis % CENTIS_PER_SECOND, 2)}`;
};
