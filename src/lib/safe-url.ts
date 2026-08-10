const ALLOWED_SCHEMES = new Set(["https:", "http:", "mailto:"]);

const parseUrl = (url: string): URL | null => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

export const isAllowedExternalUrl = (url: unknown): boolean => {
  if (typeof url !== "string" || url.length === 0) return false;
  const parsed = parseUrl(url);
  if (parsed === null) return false;
  return ALLOWED_SCHEMES.has(parsed.protocol);
};
