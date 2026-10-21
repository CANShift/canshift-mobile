export const MAX_LABEL_LENGTH = 40;

const cleanLabel = (label: string): string =>
  label.trim().slice(0, MAX_LABEL_LENGTH);

export const relabel = <T extends { key: string; label: string }>(
  sessions: readonly T[],
  key: string,
  label: string,
): T[] =>
  sessions.map((session) =>
    session.key === key ? { ...session, label: cleanLabel(label) } : session,
  );

export const withoutSession = <T extends { key: string }>(
  sessions: readonly T[],
  key: string,
): T[] => sessions.filter((session) => session.key !== key);
