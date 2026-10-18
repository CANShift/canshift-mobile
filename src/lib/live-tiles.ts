import type { SignalKey } from "../constants/ble";

export type TileFormat = "number" | "gear";

export interface LiveTileSpec {
  signal: SignalKey;
  label: string;
  spokenLabel: string;
  unit: string;
  spokenUnit: string;
  format: TileFormat;
}

const tile = (
  signal: SignalKey,
  label: string,
  spokenLabel: string,
  unit: string,
  spokenUnit: string,
): LiveTileSpec => ({
  signal,
  label,
  spokenLabel,
  unit,
  spokenUnit,
  format: "number",
});

export const TILES = {
  rpm: tile("r", "RPM", "RPM", "rpm", "rpm"),
  speed: tile("s", "SPEED", "Speed", "km/h", "kilometres per hour"),
  gear: { ...tile("g", "GEAR", "Gear", "", ""), format: "gear" },
  water: tile("ct", "WATER", "Water temp", "°C", "degrees"),
  oilPress: tile("op", "OIL P", "Oil pressure", "bar", "bar"),
  oilTemp: tile("ot", "OIL T", "Oil temp", "°C", "degrees"),
  lambda: tile("lam", "LAMBDA", "Lambda", "λ", ""),
  battery: tile("bat", "BATT", "Battery", "V", "volts"),
  fuelPress: tile("fp", "FUEL P", "Fuel pressure", "bar", "bar"),
  boost: tile("bst", "BOOST", "Boost", "bar", "bar"),
  throttle: tile("tps", "THROTTLE", "Throttle", "%", "percent"),
  intake: tile("iat", "IAT", "Intake air", "°C", "degrees"),
} satisfies Record<string, LiveTileSpec>;

type LivePageId = "overview" | "street" | "track" | "engine" | "tuning";

export interface LivePage {
  id: LivePageId;
  name: string;
  tiles: readonly LiveTileSpec[];
}

export const LIVE_PAGES: readonly LivePage[] = [
  {
    id: "overview",
    name: "Overview",
    tiles: [
      TILES.rpm,
      TILES.speed,
      TILES.water,
      TILES.oilPress,
      TILES.oilTemp,
      TILES.lambda,
      TILES.battery,
      TILES.fuelPress,
    ],
  },
  {
    id: "street",
    name: "Street",
    tiles: [TILES.speed, TILES.gear, TILES.rpm, TILES.water, TILES.battery],
  },
  {
    id: "track",
    name: "Track",
    tiles: [
      TILES.rpm,
      TILES.gear,
      TILES.speed,
      TILES.oilPress,
      TILES.water,
      TILES.oilTemp,
      TILES.boost,
      TILES.battery,
    ],
  },
  {
    id: "engine",
    name: "Engine",
    tiles: [
      TILES.water,
      TILES.oilTemp,
      TILES.oilPress,
      TILES.fuelPress,
      TILES.battery,
    ],
  },
  {
    id: "tuning",
    name: "Tuning",
    tiles: [TILES.boost, TILES.lambda, TILES.throttle, TILES.intake],
  },
];

export const TILES_PER_PAGE = 8;
