import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { UiColors } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";
import type { StepRow, StepState } from "../../lib/firmware-steps";

export interface StepListProps {
  rows: readonly StepRow[];
}

const MARK_SIZE = 22;

const MARKS: Record<StepState, () => React.JSX.Element> = {
  done: () => <Glyph name="check" size={MARK_SIZE} color={UiColors.success} />,
  active: () => <ActivityIndicator color={UiColors.text} />,
  pending: () => <View style={styles.pending} />,
};

const TEXT_COLORS: Record<StepState, string> = {
  done: UiColors.textSecondary,
  active: UiColors.text,
  pending: UiColors.textStale,
};

export const StepList = ({ rows }: StepListProps) => (
  <View style={styles.list}>
    {rows.map((row) => {
      const Mark = MARKS[row.state];
      return (
        <View key={row.step} style={styles.row} accessible>
          <View style={styles.mark}>
            <Mark />
          </View>
          <Text style={[styles.label, { color: TEXT_COLORS[row.state] }]}>
            {row.label}
          </Text>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  list: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 32 },
  mark: { width: MARK_SIZE, alignItems: "center" },
  pending: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: UiColors.surface2,
  },
  label: { fontSize: 17 },
});
