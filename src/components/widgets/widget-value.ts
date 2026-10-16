export const formatWidgetValue = (value: number, decimals: number): string =>
  decimals === 0 ? Math.round(value).toString() : value.toFixed(decimals);
