import { Pressable, StyleSheet, Text } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors, UiRadius } from "../../theme/ui-tokens";

const ICON_SIZE = 18;

const SunIcon = () => (
  <Svg
    width={ICON_SIZE}
    height={ICON_SIZE}
    viewBox="0 0 24 24"
    fill="none"
    stroke={UiColors.text}
    strokeWidth={2}
    strokeLinecap="round"
  >
    <Circle cx="12" cy="12" r="4" />
    <Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);

export interface DisplayButtonProps {
  onPress: () => void;
}

export const DisplayButton = ({ onPress }: DisplayButtonProps) => (
  <Pressable
    style={styles.button}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={STRINGS.live.display}
  >
    <SunIcon />
    <Text style={styles.label}>{STRINGS.live.display}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    minHeight: TouchTarget.min,
    paddingHorizontal: 14,
    borderRadius: UiRadius.control,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: { fontSize: 15, color: UiColors.text },
});
