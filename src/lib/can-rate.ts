const WHOLE_HZ_FROM = 1;

export const formatCanRate = (hz: number): string => {
  if (hz <= 0) return "–";
  const value = hz >= WHOLE_HZ_FROM ? String(Math.round(hz)) : hz.toFixed(1);
  return `${value} Hz`;
};
