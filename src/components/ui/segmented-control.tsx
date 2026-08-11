import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors, Typography, Fonts } from "../../theme";

export interface SegmentedControlOption<
  T extends string | number | boolean | null,
> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number | boolean | null> {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export const SegmentedControl = <T extends string | number | boolean | null>({
  options,
  value,
  onChange,
  disabled = false,
}: SegmentedControlProps<T>) => (
  <View style={styles.track} accessibilityRole="tablist">
    {options.map((option) => {
      const active = option.value === value;
      return (
        <Pressable
          key={String(option.value)}
          style={[styles.segment, active && styles.segmentActive]}
          onPress={() => {
            onChange(option.value);
          }}
          disabled={disabled}
          accessibilityRole="tab"
          accessibilityState={{ selected: active, disabled }}
          accessibilityLabel={option.label}
        >
          <Text style={[styles.label, active && styles.labelActive]}>
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const SEGMENT_UNDERLINE = 3;

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.ruleHair,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: SEGMENT_UNDERLINE,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  segmentActive: { borderBottomColor: Colors.accent },
  label: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.sm,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.textMuted,
  },
  labelActive: { color: Colors.text },
});
