const STOICH_AFR_PER_LAMBDA = 14.7;

const LAMBDA_KEYS = new Set(["lam"]);

export const toSensorKindValue = (key: string, value: number): number =>
  LAMBDA_KEYS.has(key) ? value * STOICH_AFR_PER_LAMBDA : value;

export const fromSensorKindValue = (key: string, value: number): number =>
  LAMBDA_KEYS.has(key) ? value / STOICH_AFR_PER_LAMBDA : value;
