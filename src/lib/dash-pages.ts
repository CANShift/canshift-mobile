import type { SignalKey } from "../constants/ble";

export type DashValueClass =
  "hero" | "heroTrack" | "primary" | "mid" | "secondary";

export type DashPageId = "street" | "track" | "engine" | "tuning";

export interface DashWidgetSpec {
  signal: SignalKey;
  kicker: string;
  span: number;
  valueClass: DashValueClass;
  unit?: string;
  bar?: true;
}

export interface DashPage {
  id: DashPageId;
  name: string;
  shiftLight: boolean;
  widgets: readonly DashWidgetSpec[];
}

const STREET: DashPage = {
  id: "street",
  name: "Street",
  shiftLight: false,
  widgets: [
    { signal: "s", kicker: "SPEED", span: 7, valueClass: "hero", unit: "km/h" },
    { signal: "g", kicker: "GEAR", span: 5, valueClass: "hero" },
    {
      signal: "r",
      kicker: "RPM",
      span: 6,
      valueClass: "mid",
      unit: "rpm",
      bar: true,
    },
    {
      signal: "ct",
      kicker: "WATER",
      span: 3,
      valueClass: "secondary",
      unit: "°C",
    },
    {
      signal: "bat",
      kicker: "BATT",
      span: 4,
      valueClass: "secondary",
      unit: "V",
    },
  ],
};

const TRACK: DashPage = {
  id: "track",
  name: "Track",
  shiftLight: true,
  widgets: [
    {
      signal: "r",
      kicker: "RPM",
      span: 7,
      valueClass: "heroTrack",
      unit: "rpm",
    },
    { signal: "g", kicker: "GEAR", span: 5, valueClass: "heroTrack" },
    {
      signal: "s",
      kicker: "SPEED",
      span: 6,
      valueClass: "primary",
      unit: "km/h",
    },
    {
      signal: "op",
      kicker: "OIL PRESS",
      span: 6,
      valueClass: "primary",
      unit: "bar",
    },
    {
      signal: "ct",
      kicker: "WATER",
      span: 3,
      valueClass: "secondary",
      unit: "°C",
    },
    {
      signal: "ot",
      kicker: "OIL T",
      span: 3,
      valueClass: "secondary",
      unit: "°C",
    },
    {
      signal: "bst",
      kicker: "BOOST",
      span: 3,
      valueClass: "secondary",
      unit: "bar",
    },
    {
      signal: "bat",
      kicker: "BATT",
      span: 3,
      valueClass: "secondary",
      unit: "V",
    },
  ],
};

const ENGINE: DashPage = {
  id: "engine",
  name: "Engine",
  shiftLight: false,
  widgets: [
    {
      signal: "ct",
      kicker: "WATER",
      span: 6,
      valueClass: "primary",
      unit: "°C",
      bar: true,
    },
    {
      signal: "ot",
      kicker: "OIL TEMP",
      span: 6,
      valueClass: "primary",
      unit: "°C",
      bar: true,
    },
    {
      signal: "op",
      kicker: "OIL PRESS",
      span: 6,
      valueClass: "primary",
      unit: "bar",
      bar: true,
    },
    {
      signal: "fp",
      kicker: "FUEL PRESS",
      span: 6,
      valueClass: "primary",
      unit: "bar",
    },
    {
      signal: "bat",
      kicker: "BATT",
      span: 4,
      valueClass: "secondary",
      unit: "V",
    },
  ],
};

const TUNING: DashPage = {
  id: "tuning",
  name: "Tuning",
  shiftLight: false,
  widgets: [
    {
      signal: "bst",
      kicker: "BOOST",
      span: 7,
      valueClass: "heroTrack",
      unit: "bar",
      bar: true,
    },
    {
      signal: "lam",
      kicker: "LAMBDA",
      span: 6,
      valueClass: "primary",
      unit: "λ",
    },
    {
      signal: "tps",
      kicker: "THROTTLE",
      span: 6,
      valueClass: "primary",
      unit: "%",
      bar: true,
    },
    {
      signal: "iat",
      kicker: "IAT",
      span: 4,
      valueClass: "secondary",
      unit: "°C",
    },
  ],
};

export const DASH_PAGES: readonly DashPage[] = [STREET, TRACK, ENGINE, TUNING];

export const DEFAULT_DASH_PAGE_ID: DashPageId = "street";

export const dashPageById = (id: DashPageId): DashPage =>
  DASH_PAGES.find((page) => page.id === id) ?? STREET;

export const DASH_PAGE_OPTIONS = DASH_PAGES.map((page) => ({
  value: page.id,
  label: page.name,
}));
