import { Pressable, StyleSheet, Text, View } from "react-native";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string | number> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  stretch?: boolean;
}

export const Segmented = <T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
  stretch = false,
}: SegmentedProps<T>) => (
  <View
    style={[styles.track, stretch ? styles.stretch : null]}
    accessibilityRole="tablist"
    accessibilityLabel={accessibilityLabel}
  >
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <Pressable
          key={String(option.value)}
          style={[
            styles.option,
            stretch ? styles.optionStretch : null,
            selected ? styles.selected : null,
          ]}
          onPress={() => {
            onChange(option.value);
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected }}
          accessibilityLabel={option.label}
        >
          <Text style={selected ? styles.labelSelected : styles.label}>
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    padding: 2,
    borderRadius: UiRadius.control,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
  },
  stretch: { alignSelf: "stretch" },
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
