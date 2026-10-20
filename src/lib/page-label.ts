const WORD_SEPARATORS = /[_-]+/g;

export const pageLabel = (pageId: string): string => {
  const words = pageId.replace(WORD_SEPARATORS, " ").trim();
  if (words.length === 0) return pageId;
  return words.charAt(0).toUpperCase() + words.slice(1);
};
