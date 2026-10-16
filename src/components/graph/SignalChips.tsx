import { StyleSheet, View } from "react-native";
import { SIGNAL_META, type SignalKey } from "../../constants/ble";
import type { SignalValues } from "../../stores/telemetry.store";
import { formatNumber } from "../../lib/graph-math";
import { seriesStyle } from "../../lib/graph-config";
import { NO_VALUE } from "../../lib/tile-state";
import { SignalChip } from "./SignalChip";
import { AddSignalChip } from "./AddSignalChip";

export interface SignalChipsProps {
  signals: readonly SignalKey[];
  latest: SignalValues;
  onRemove: (key: SignalKey) => void;
  onAdd: () => void;
}

const chipValue = (key: SignalKey, latest: SignalValues): string =>
  latest[key] === undefined ? NO_VALUE : formatNumber(key, latest[key]);

export const SignalChips = ({
  signals,
  latest,
  onRemove,
  onAdd,
}: SignalChipsProps) => (
  <View style={styles.row}>
    {signals.map((key, index) => (
      <SignalChip
        key={key}
        name={SIGNAL_META[key].label}
        value={chipValue(key, latest)}
        hasValue={latest[key] !== undefined}
        series={seriesStyle(index)}
        onRemove={() => {
          onRemove(key);
        }}
      />
    ))}
    <AddSignalChip onPress={onAdd} />
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
