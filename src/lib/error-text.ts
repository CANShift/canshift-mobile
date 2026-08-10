export const errText = (err: unknown, fallback = "unknown error"): string => {
  if (err instanceof Error && err.message.length > 0) return err.message;
  if (typeof err === "string" && err.length > 0) return err;
  return fallback;
};
