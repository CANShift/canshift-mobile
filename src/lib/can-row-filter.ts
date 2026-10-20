import type { CanRow } from "./can-monitor-model";
import { formatCanData } from "./can-hex";

const HEX_PREFIX = /^0X/;
const SPACES = /\s+/g;

const normalised = (value: string): string =>
  value.toUpperCase().replace(SPACES, "").replace(HEX_PREFIX, "");

const idMatches = (row: CanRow, query: string): boolean =>
  row.idLabel.startsWith(query) ||
  row.id.toString(16).toUpperCase().startsWith(query);

const matchesRow = (row: CanRow, query: string): boolean =>
  idMatches(row, query) || normalised(formatCanData(row.data)).includes(query);

export const filterCanRows = (
  rows: readonly CanRow[],
  filter: string,
): readonly CanRow[] => {
  const query = normalised(filter);
  if (query.length === 0) return rows;
  return rows.filter((row) => matchesRow(row, query));
};
