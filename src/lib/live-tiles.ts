import type { SignalKey } from "../constants/ble";

export interface LiveTileSpec {
  signal: SignalKey;
  label: string;
  spokenLabel: string;
  unit: string;
  spokenUnit: string;
}

export const LIVE_TILES: readonly LiveTileSpec[] = [
  {
    signal: "r",
    label: "RPM",
    spokenLabel: "RPM",
    unit: "rpm",
    spokenUnit: "rpm",
  },
  {
    signal: "s",
    label: "SPEED",
    spokenLabel: "Speed",
    unit: "km/h",
    spokenUnit: "kilometres per hour",
  },
  {
    signal: "ct",
    label: "WATER",
    spokenLabel: "Water temp",
    unit: "°C",
    spokenUnit: "degrees",
  },
  {
    signal: "op",
    label: "OIL P",
    spokenLabel: "Oil pressure",
    unit: "bar",
    spokenUnit: "bar",
  },
  {
    signal: "ot",
    label: "OIL T",
    spokenLabel: "Oil temp",
    unit: "°C",
    spokenUnit: "degrees",
  },
  {
    signal: "lam",
    label: "LAMBDA",
    spokenLabel: "Lambda",
    unit: "λ",
    spokenUnit: "",
  },
  {
    signal: "bat",
    label: "BATT",
    spokenLabel: "Battery",
    unit: "V",
    spokenUnit: "volts",
  },
  {
    signal: "fp",
    label: "FUEL P",
    spokenLabel: "Fuel pressure",
    unit: "bar",
    spokenUnit: "bar",
  },
];
