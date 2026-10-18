import { SIGNAL_META, type SignalKey } from "../../constants/ble";
import type { SignalValues } from "../../stores/telemetry.store";
import { formatNumber } from "../../lib/graph-math";
import { seriesStyle } from "../../lib/graph-config";
import type { GraphSelection } from "../../hooks/use-graph-selection";
import { PickerRow } from "./PickerRow";

interface SignalPickerRowProps {
  signal: SignalKey;
  selection: GraphSelection;
  latest: SignalValues;
}

export const SignalPickerRow = ({
  signal,
  selection,
  latest,
}: SignalPickerRowProps) => {
  const index = selection.signals.indexOf(signal);
  return (
    <PickerRow
      name={SIGNAL_META[signal].label}
      value={formatNumber(signal, latest[signal])}
      checked={index >= 0}
      swatch={index >= 0 ? seriesStyle(index) : null}
      onPress={() => {
        selection.toggle(signal);
      }}
    />
  );
};
