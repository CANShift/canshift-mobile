const VERSION_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)/;

const partsOf = (version: string): number[] | null => {
  const match = VERSION_PATTERN.exec(version.trim());
  return match === null ? null : match.slice(1).map(Number);
};

const compareParts = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((order, part, index) => order || part - (b[index] ?? 0), 0);

export const sameVersion = (a: string, b: string): boolean => {
  const left = partsOf(a);
  const right = partsOf(b);
  return left !== null && right !== null && compareParts(left, right) === 0;
};

export const isNewerThan = (candidate: string, running: string): boolean => {
  const next = partsOf(candidate);
  if (next === null) return false;
  const current = partsOf(running);
  return current === null || compareParts(next, current) > 0;
};
