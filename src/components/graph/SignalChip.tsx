import { Pressable, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors, UiFonts } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";

const CHIP_HEIGHT = TouchTarget.min;
const REMOVE_SIZE = 36;

export interface SignalChipProps {
  name: string;
  value: string;
  color: string;
  hasValue: boolean;
  onRemove: () => void;
}

export const SignalChip = ({
  name,
  value,
  color,
  hasValue,
  onRemove,
}: SignalChipProps) => (
  <View style={styles.chip}>
    <View style={[styles.swatch, { backgroundColor: color }]} />
    <Text style={styles.name}>{name}</Text>
    <Text style={[styles.value, hasValue ? null : styles.noValue]}>
      {value}
    </Text>
    <Pressable
      style={styles.remove}
      onPress={onRemove}
      accessibilityRole="button"
      accessibilityLabel={STRINGS.graph.removeSignal(name)}
    >
      <Glyph name="close" size={16} color={UiColors.textMuted} />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  chip: {
    height: CHIP_HEIGHT,
    paddingLeft: 12,
    paddingRight: 4,
    borderRadius: CHIP_HEIGHT / 2,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  swatch: { width: 14, height: 4, borderRadius: 2 },
  name: { fontSize: 14, color: UiColors.text },
  value: {
    fontSize: 14,
    fontFamily: UiFonts.numeric,
    fontWeight: "700",
    color: UiColors.text,
  },
  noValue: { color: UiColors.textStale },
  remove: {
    width: REMOVE_SIZE,
    height: REMOVE_SIZE,
    borderRadius: REMOVE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
