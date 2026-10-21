import { StyleSheet, Text, View } from "react-native";
import { UiColors, UiFonts, UiRadius } from "../../theme/ui-tokens";
import type { StatTile } from "../../lib/session-view";

export interface StatGridProps {
  tiles: readonly StatTile[];
}

export const StatGrid = ({ tiles }: StatGridProps) => (
  <View style={styles.grid}>
    {tiles.map((tile) => (
      <View key={tile.label} style={styles.tile} accessible>
        <Text style={styles.label}>{tile.label}</Text>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {tile.value}
        </Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    flexGrow: 1,
    flexBasis: "40%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
    borderRadius: UiRadius.tile,
    backgroundColor: UiColors.surface,
    borderWidth: 1,
    borderColor: UiColors.border,
  },
  label: { fontSize: 14, color: UiColors.textMuted },
  value: {
    fontSize: 26,
    fontFamily: UiFonts.numeric,
    fontWeight: "700",
    color: UiColors.text,
  },
});
