import { SIGNAL_META, type SignalKey } from "../constants/ble";
import { STRINGS } from "../strings";
import { formatWidgetValue } from "../components/widgets/widget-value";
import { isSignalInDanger } from "./signal-danger";
import { ageSeconds, isSignalFresh } from "./signal-staleness";
import type { LiveTileSpec } from "./live-tiles";

export type TileState = "normal" | "warning" | "danger" | "stale" | "nodata";

export const NO_VALUE = "—";

export interface TileReading {
  value: number | undefined;
  lastAt: number | undefined;
  paused: boolean;
  nowMs: number;
}

export interface TileModel {
  state: TileState;
  text: string;
  tag: string;
  accessibilityLabel: string;
}

export const tileState = (
  signal: SignalKey,
  reading: TileReading,
): TileState => {
  if (reading.value === undefined) return "nodata";
  if (reading.paused || !isSignalFresh(reading.lastAt, reading.nowMs))
    return "stale";
  return isSignalInDanger(signal, reading.value) ? "danger" : "normal";
};

const ageOf = (reading: TileReading): number =>
  ageSeconds(reading.lastAt ?? reading.nowMs, reading.nowMs);

const TAGS: Record<TileState, (reading: TileReading) => string> = {
  normal: () => "",
  warning: () => STRINGS.live.warning,
  danger: () => STRINGS.live.danger,
  stale: (reading) => STRINGS.stale.secondsAgo(ageOf(reading)),
  nodata: () => STRINGS.stale.noData,
};

const SPOKEN_STATES: Record<TileState, (reading: TileReading) => string> = {
  normal: () => "",
  warning: () => "warning",
  danger: () => "danger",
  stale: (reading) => `${String(ageOf(reading))} seconds ago`,
  nodata: () => "no data",
};

const spokenValue = (spec: LiveTileSpec, text: string): string =>
  [text, spec.spokenUnit].filter((part) => part.length > 0).join(" ");

export const tileModel = (
  spec: LiveTileSpec,
  reading: TileReading,
): TileModel => {
  const state = tileState(spec.signal, reading);
  const text =
    reading.value === undefined
      ? NO_VALUE
      : formatWidgetValue(reading.value, SIGNAL_META[spec.signal].decimals);
  const spoken = [
    spec.spokenLabel,
    reading.value === undefined ? "" : spokenValue(spec, text),
    SPOKEN_STATES[state](reading),
  ].filter((part) => part.length > 0);
  return {
    state,
    text,
    tag: TAGS[state](reading),
    accessibilityLabel: spoken.join(", "),
  };
};
