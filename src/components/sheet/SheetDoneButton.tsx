import { Pressable, StyleSheet, Text } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";

export interface SheetDoneButtonProps {
  label: string;
  onPress: () => void;
}

export const SheetDoneButton = ({ label, onPress }: SheetDoneButtonProps) => (
  <Pressable
    style={styles.done}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Text style={styles.text}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  done: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: UiRadius.tile,
    backgroundColor: UiColors.text,
    justifyContent: "center",
  },
  text: { fontSize: 16, fontWeight: "700", color: UiColors.bg },
});
