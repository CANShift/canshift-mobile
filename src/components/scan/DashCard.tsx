import { Pressable, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";
import type { ScanResult } from "../../services/ble.service";
import {
  SIGNAL_BARS,
  SIGNAL_LABELS,
  signalStrength,
} from "../../lib/signal-strength";

const BAR_HEIGHTS = [6, 11, 16, 20];

export interface DashCardProps {
  dash: ScanResult;
  lastUsed: boolean;
  onPress: (dash: ScanResult) => void;
}

const SignalBars = ({ bars }: { bars: number }) => (
  <View style={styles.bars}>
    {BAR_HEIGHTS.map((height, index) => (
      <View
        key={height}
        style={[
          styles.bar,
          {
            height,
            backgroundColor:
              index < bars ? UiColors.text : UiColors.borderStrong,
          },
        ]}
      />
    ))}
  </View>
);

export const DashCard = ({ dash, lastUsed, onPress }: DashCardProps) => {
  const strength = signalStrength(dash.rssi);
  const signal = SIGNAL_LABELS[strength];
  const detail = lastUsed
    ? STRINGS.connect.dashDetail(STRINGS.connect.lastUsed, signal)
    : signal;
  return (
    <Pressable
      style={[styles.card, lastUsed ? styles.last : null]}
      onPress={() => {
        onPress(dash);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${dash.name}, ${detail}`}
    >
      <View style={styles.copy}>
        <Text style={styles.name}>{dash.name}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <SignalBars bars={SIGNAL_BARS[strength]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: TouchTarget.driving + 16,
    paddingHorizontal: 16,
    borderRadius: UiRadius.card,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  last: { borderWidth: 2, borderColor: UiColors.text },
  copy: { flex: 1, gap: 3 },
  name: { fontSize: 18, fontWeight: "600", color: UiColors.text },
  detail: { fontSize: 14, color: UiColors.textMuted },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 20 },
  bar: { width: 5, borderRadius: 1 },
});
