import { StyleSheet, Text, View } from "react-native";
import { UiFonts } from "../../theme/ui-tokens";
import type { TileLook } from "../../lib/tile-look";

const UNIT_SIZE = 16;

interface TileReadingProps {
  value: string;
  unit: string;
  look: TileLook;
  valueSize: number;
}

export const TileReading = ({
  value,
  unit,
  look,
  valueSize,
}: TileReadingProps) => (
  <View style={styles.reading}>
    <Text
      style={[styles.value, { color: look.valueColor, fontSize: valueSize }]}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {value}
    </Text>
    <Text style={[styles.unit, { color: look.unitColor }]}>{unit}</Text>
  </View>
);

const styles = StyleSheet.create({
  reading: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  value: {
    flexShrink: 1,
    fontFamily: UiFonts.numeric,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  unit: { fontSize: UNIT_SIZE },
});
