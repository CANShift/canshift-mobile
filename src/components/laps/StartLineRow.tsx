import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import type { LineRowKind } from "../../lib/line-row";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";
import { LINE_STATES, type LineStateProps } from "./circuits/LineRowStates";

export interface StartLineRowProps extends LineStateProps {
  kind: LineRowKind;
}

export const StartLineRow = ({ kind, ...state }: StartLineRowProps) => {
  const LineState = LINE_STATES[kind];
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{STRINGS.laps.line}</Text>
      <LineState {...state} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    minHeight: TouchTarget.driving,
    paddingHorizontal: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  title: { flexGrow: 1, fontSize: 17, fontWeight: "600", color: UiColors.text },
});
