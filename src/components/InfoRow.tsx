import { View, Text, StyleSheet } from "react-native";
import { Colors, Fonts, Spacing, TabularNums } from "../theme";

export interface InfoRowProps {
  label: string;
  value: string;
  muted?: boolean;
}

const ROW_TEXT_SIZE = 17;
const ROW_PADDING_VERTICAL = 21;

export const InfoRow = ({ label, value, muted = false }: InfoRowProps) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, muted && styles.valueMuted]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: ROW_PADDING_VERTICAL,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ruleHair,
  },
  label: {
    fontFamily: Fonts.mono,
    fontSize: ROW_TEXT_SIZE,
    color: Colors.textMuted,
  },
  value: {
    flexShrink: 1,
    textAlign: "right",
    fontFamily: Fonts.mono,
    fontSize: ROW_TEXT_SIZE,
    fontVariant: TabularNums,
    color: Colors.text,
  },
  valueMuted: {
    color: Colors.textMuted,
  },
});
