import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { UiColors, UiFonts, UiRadius } from "../../theme/ui-tokens";
import { TILE_LOOKS } from "../../lib/tile-look";
import type { TileState } from "../../lib/tile-state";
import { TileTag } from "./TileTag";

const LABEL_SIZE = 14;
const UNIT_SIZE = 16;

interface ValueTileProps {
  label: string;
  value: string;
  unit: string;
  state: TileState;
  tag: string;
  accessibilityLabel: string;
  valueSize: number;
}

const ValueTile = ({
  label,
  value,
  unit,
  state,
  tag,
  accessibilityLabel,
  valueSize,
}: ValueTileProps) => {
  const look = TILE_LOOKS[state];
  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: look.background,
          borderColor: look.borderColor,
          borderWidth: look.borderWidth,
          borderStyle: look.borderStyle,
        },
      ]}
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.top}>
        <Text style={[styles.label, { color: look.labelColor }]}>{label}</Text>
        <TileTag tag={tag} look={look} />
      </View>
      <View style={styles.reading}>
        <Text
          style={[
            styles.value,
            { color: look.valueColor, fontSize: valueSize },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
        <Text style={[styles.unit, { color: look.unitColor }]}>{unit}</Text>
      </View>
    </View>
  );
};

export default React.memo(ValueTile);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: UiRadius.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: "space-between",
    backgroundColor: UiColors.surface,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: LABEL_SIZE,
    fontWeight: "700",
    letterSpacing: LABEL_SIZE * 0.06,
  },
  reading: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  value: {
    flexShrink: 1,
    fontFamily: UiFonts.numeric,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  unit: { fontSize: UNIT_SIZE },
});
