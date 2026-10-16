import { Pressable, StyleSheet, Text } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";

const BUTTON_HEIGHT = 48;

export interface BannerButtonProps {
  label: string;
  onPress: () => void;
}

export const BannerButton = ({ label, onPress }: BannerButtonProps) => (
  <Pressable
    style={styles.button}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Text style={styles.text}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    height: BUTTON_HEIGHT,
    paddingHorizontal: 16,
    borderRadius: UiRadius.control,
    borderWidth: 1,
    borderColor: UiColors.warningBorder,
    justifyContent: "center",
  },
  text: { fontSize: 15, fontWeight: "600", color: UiColors.warningTextStrong },
});
