import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, Fonts, Typography, SCREEN_PADDING } from "../theme";

export interface NavRowProps {
  label: string;
  onPress: () => void;
}

export const NavRow = ({ label, onPress }: NavRowProps) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SCREEN_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ruleHair,
  },
  label: {
    fontFamily: Fonts.mono,
    fontSize: Typography.md,
    color: Colors.text,
  },
  chevron: {
    fontFamily: Fonts.mono,
    fontSize: Typography.lg,
    color: Colors.textMuted,
  },
});
