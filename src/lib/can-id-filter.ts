import {
  CAN_EXTENDED_ID_MAX,
  CAN_STANDARD_ID_MAX,
  type CanIdFilter,
} from "@canshift/core/wire";

const STANDARD_ID = /^[0-9A-F]{3}$/;
const EXTENDED_ID = /^[0-9A-F]{8}$/;
const HEX_PREFIX = /^0X/;
const SPACES = /\s+/g;

const exact = (id: number, extended: boolean): CanIdFilter[] => [
  { id, extended, mask: extended ? CAN_EXTENDED_ID_MAX : CAN_STANDARD_ID_MAX },
];

export const dashFilterFor = (text: string): CanIdFilter[] => {
  const hex = text.toUpperCase().replace(SPACES, "").replace(HEX_PREFIX, "");
  const id = Number.parseInt(hex, 16);
  if (STANDARD_ID.test(hex) && id <= CAN_STANDARD_ID_MAX)
    return exact(id, false);
  if (EXTENDED_ID.test(hex) && id <= CAN_EXTENDED_ID_MAX)
    return exact(id, true);
  return [];
};

export const filterKey = (filters: readonly CanIdFilter[]): string =>
  filters.map((f) => `${String(f.extended)}:${String(f.id)}`).join(",");
