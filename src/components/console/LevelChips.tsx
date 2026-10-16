import { Pressable, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import type { LevelFilter } from "../../hooks/use-log-filter";

const CHIP_HEIGHT = 36;

const LEVELS: readonly { value: LevelFilter; label: string }[] = [
  { value: "all", label: STRINGS.console.filterAll },
  { value: "info", label: STRINGS.console.filterInfo },
  { value: "warn", label: STRINGS.console.filterWarnings },
  { value: "error", label: STRINGS.console.filterErrors },
];

export interface LevelChipsProps {
  level: LevelFilter;
  onLevel: (level: LevelFilter) => void;
}

export const LevelChips = ({ level, onLevel }: LevelChipsProps) => (
  <View style={styles.row} accessibilityLabel={STRINGS.console.level}>
    {LEVELS.map((option) => {
      const selected = option.value === level;
      return (
        <Pressable
          key={option.value}
          style={[styles.chip, selected ? styles.on : styles.off]}
          onPress={() => {
            onLevel(option.value);
          }}
          hitSlop={{ top: 4, bottom: 4 }}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={option.label}
        >
          <Text style={selected ? styles.onText : styles.offText}>
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  chip: {
    height: CHIP_HEIGHT,
    paddingHorizontal: 12,
    borderRadius: CHIP_HEIGHT / 2,
    justifyContent: "center",
  },
  on: { backgroundColor: UiColors.text },
  off: { borderWidth: 1, borderColor: UiColors.border },
  onText: { fontSize: 14, fontWeight: "700", color: UiColors.bg },
  offText: { fontSize: 14, color: UiColors.textSecondary },
});
