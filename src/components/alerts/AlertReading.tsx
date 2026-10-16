import { StyleSheet, Text, View } from "react-native";
import { UiColors, UiFonts } from "../../theme/ui-tokens";

export interface AlertReadingProps {
  value: string;
  unit: string;
  valueSize: number;
}

export const AlertReading = ({ value, unit, valueSize }: AlertReadingProps) => (
  <View style={styles.row}>
    <Text
      style={[styles.value, { fontSize: valueSize, lineHeight: valueSize }]}
      numberOfLines={1}
    >
      {value}
    </Text>
    <Text style={[styles.unit, { fontSize: Math.round(valueSize / 4) }]}>
      {unit}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  value: {
    fontFamily: UiFonts.numeric,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    color: UiColors.onPrimary,
  },
  unit: { fontWeight: "700", color: UiColors.onPrimary },
});
