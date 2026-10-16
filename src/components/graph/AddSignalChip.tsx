import { Pressable, StyleSheet, Text } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";

export interface AddSignalChipProps {
  onPress: () => void;
}

export const AddSignalChip = ({ onPress }: AddSignalChipProps) => (
  <Pressable
    style={styles.chip}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={STRINGS.graph.addSignal}
  >
    <Glyph name="plus" size={16} color={UiColors.text} />
    <Text style={styles.label}>{STRINGS.graph.addSignal}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    height: TouchTarget.min,
    paddingHorizontal: 14,
    borderRadius: TouchTarget.min / 2,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: UiColors.borderStrong,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: { fontSize: 14, color: UiColors.text },
});
