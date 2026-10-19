import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";
import { ToolButton } from "../buttons/ToolButton";

export interface StartLineRowProps {
  lineSet: boolean;
  onReset: () => void;
}

const LineSet = ({ onReset }: Pick<StartLineRowProps, "onReset">) => (
  <View style={styles.state}>
    <Glyph name="check" size={16} color={UiColors.success} />
    <Text style={styles.set}>{STRINGS.laps.lineSet}</Text>
    <ToolButton label={STRINGS.laps.resetLine} onPress={onReset} />
  </View>
);

export const StartLineRow = ({ lineSet, onReset }: StartLineRowProps) => (
  <View style={styles.row}>
    <Text style={styles.title}>{STRINGS.laps.line}</Text>
    {lineSet ? (
      <LineSet onReset={onReset} />
    ) : (
      <Text style={styles.notSet}>{STRINGS.laps.lineNotSet}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    minHeight: TouchTarget.driving,
    paddingHorizontal: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  state: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flexGrow: 1, fontSize: 17, fontWeight: "600", color: UiColors.text },
  set: { fontSize: 15, color: UiColors.success },
  notSet: { fontSize: 15, color: UiColors.textMuted },
});
