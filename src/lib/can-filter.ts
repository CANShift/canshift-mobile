export interface CanIdRange {
  from: number;
  to: number;
}

type CanEmptyCause = "filtered" | "unfiltered";

const HEX_BASE = 16;
const HEX_DIGITS = 3;
const EN_DASH = "–";

const EMPTY_MESSAGE: Record<CanEmptyCause, string> = {
  filtered: "NO FRAMES YET.\nTHE BUS IS QUIET OR THE\nFILTER IS TOO NARROW.",
  unfiltered: "NO FRAMES YET.\nTHE BUS IS QUIET.",
};

const causeOf = (range: CanIdRange | null): CanEmptyCause =>
  range === null ? "unfiltered" : "filtered";

const formatCanId = (id: number): string =>
  `0x${id.toString(HEX_BASE).toUpperCase().padStart(HEX_DIGITS, "0")}`;

export const CLEAR_FILTER_LABEL = "CLEAR FILTER";

export const canEmptyMessage = (range: CanIdRange | null): string =>
  EMPTY_MESSAGE[causeOf(range)];

export const canFilterLabel = (range: CanIdRange | null): string =>
  range === null
    ? "Filter: none"
    : `Filter: ID ${formatCanId(range.from)} ${EN_DASH} ${formatCanId(range.to)}`;
