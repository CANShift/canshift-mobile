import { StyleSheet, View } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import {
  SegmentedOptionButton,
  type SegmentedOption,
} from "./SegmentedOptionButton";

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
    {options.map((option) => (
      <SegmentedOptionButton
        key={String(option.value)}
        option={option}
        selected={option.value === value}
        stretch={stretch}
        onChange={onChange}
      />
    ))}
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
});
