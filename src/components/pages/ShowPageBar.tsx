import { Pressable, StyleSheet, Text } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";

const BAR_HEIGHT = 64;

export interface ShowPageBarProps {
  label: string;
  enabled: boolean;
  onPress: () => void;
}

export const ShowPageBar = ({ label, enabled, onPress }: ShowPageBarProps) => (
  <Pressable
    style={({ pressed }) => [
      styles.bar,
      enabled ? styles.on : styles.off,
      { opacity: pressed ? 0.85 : 1 },
    ]}
    onPress={onPress}
    disabled={!enabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled: !enabled }}
  >
    <Text
      style={[styles.label, enabled ? styles.labelOn : styles.labelOff]}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  bar: {
    height: BAR_HEIGHT,
    paddingHorizontal: 20,
    borderRadius: UiRadius.control,
    borderWidth: 1,
    justifyContent: "center",
  },
  on: {
    backgroundColor: UiColors.primaryBtn,
    borderColor: UiColors.primaryBtn,
  },
  off: { backgroundColor: UiColors.surface2, borderColor: UiColors.border },
  label: { fontSize: 16, fontWeight: "800", letterSpacing: 0.6 },
  labelOn: { color: UiColors.onPrimary },
  labelOff: { color: UiColors.textStale },
});
