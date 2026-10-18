import { Pressable, StyleSheet, Text } from "react-native";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";

const OPTION_HIT_SLOP = { top: 6, bottom: 6 };

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedOptionButtonProps<T extends string | number> {
  option: SegmentedOption<T>;
  selected: boolean;
  stretch: boolean;
  onChange: (value: T) => void;
}

export const SegmentedOptionButton = <T extends string | number>({
  option,
  selected,
  stretch,
  onChange,
}: SegmentedOptionButtonProps<T>) => (
  <Pressable
    style={[
      styles.option,
      stretch ? styles.optionStretch : null,
      selected ? styles.selected : null,
    ]}
    onPress={() => {
      onChange(option.value);
    }}
    hitSlop={OPTION_HIT_SLOP}
    accessibilityRole="tab"
    accessibilityState={{ selected }}
    accessibilityLabel={option.label}
  >
    <Text style={selected ? styles.labelSelected : styles.label}>
      {option.label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  option: {
    minHeight: TouchTarget.min,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  optionStretch: { flex: 1 },
  selected: { backgroundColor: UiColors.text },
  label: { fontSize: 15, color: UiColors.textSecondary },
  labelSelected: { fontSize: 15, fontWeight: "700", color: UiColors.bg },
});
