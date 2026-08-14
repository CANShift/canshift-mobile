import { SIGNAL_META, type SignalKey } from "../../constants/ble";
import { useSignalValue, useSignalsIsLive } from "../../stores/signals.store";
import { LabelWidget } from "../widgets";
import { heldPlaceholder } from "../widgets/widget-value";

export interface GridLabelProps {
  signalKey: SignalKey;
  width: number;
  height: number;
  dayMode: boolean;
}

export const GridLabel = ({
  signalKey,
  width,
  height,
  dayMode,
}: GridLabelProps) => {
  const value = useSignalValue(signalKey);
  const isLive = useSignalsIsLive();
  return (
    <LabelWidget
      signalKey={signalKey}
      value={isLive ? value : undefined}
      placeholder={heldPlaceholder(value, SIGNAL_META[signalKey].decimals)}
      width={width}
      height={height}
      dayMode={dayMode}
    />
  );
};
