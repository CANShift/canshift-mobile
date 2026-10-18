import { Pressable, StyleSheet, Text } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";

const BUTTON_HEIGHT = 52;

interface ConnectionActionButtonProps {
  label: string;
  onPress: () => void;
}

export const ConnectionActionButton = ({
  label,
  onPress,
}: ConnectionActionButtonProps) => (
  <Pressable
    style={styles.button}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    height: BUTTON_HEIGHT,
    paddingHorizontal: 16,
    borderRadius: UiRadius.tile,
    borderWidth: 1,
    borderColor: UiColors.border,
    justifyContent: "center",
  },
  buttonText: { fontSize: 16, color: UiColors.text },
});
