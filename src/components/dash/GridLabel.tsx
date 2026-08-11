import type { SignalKey } from "../../constants/ble";
import { useSignalValue, useSignalsIsLive } from "../../stores/signals.store";
import { LabelWidget } from "../widgets";

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
      width={width}
      height={height}
      dayMode={dayMode}
    />
  );
};
