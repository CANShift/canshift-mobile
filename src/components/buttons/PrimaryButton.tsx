import { Pressable, StyleSheet, Text } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";

const LABEL_SIZE = 17;

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  height: number;
}

export const PrimaryButton = ({
  label,
  onPress,
  height,
}: PrimaryButtonProps) => (
  <Pressable
    style={({ pressed }) => [
      styles.button,
      { height, opacity: pressed ? 0.85 : 1 },
    ]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: UiRadius.sheet,
    backgroundColor: UiColors.primaryBtn,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: LABEL_SIZE, fontWeight: "700", color: UiColors.onPrimary },
});
