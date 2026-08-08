import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors, Radius, Typography, Fonts } from "../../theme";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) => (
  <View style={styles.track} accessibilityRole="tablist">
    {options.map((option) => {
      const active = option.value === value;
      return (
        <Pressable
          key={option.value}
          style={[styles.segment, active && styles.segmentActive]}
          onPress={() => {
            onChange(option.value);
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
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

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.sm,
  },
  segmentActive: { backgroundColor: Colors.accent },
  label: {
    fontFamily: Fonts.uiSemiBold,
    fontSize: Typography.sm,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: Colors.textMuted,
  },
  labelActive: { color: Colors.bg, fontFamily: Fonts.uiExtraBold },
});
