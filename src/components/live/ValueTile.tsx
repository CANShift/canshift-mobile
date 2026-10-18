import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import { TILE_LOOKS, type TileLook } from "../../lib/tile-look";
import type { TileState } from "../../lib/tile-state";
import { TileTag } from "./TileTag";
import { TileReading } from "./TileReading";

const LABEL_SIZE = 14;

interface ValueTileProps {
  label: string;
  value: string;
  unit: string;
  state: TileState;
  tag: string;
  accessibilityLabel: string;
  valueSize: number;
}

const tileFrame = (look: TileLook) => ({
  backgroundColor: look.background,
  borderColor: look.borderColor,
  borderWidth: look.borderWidth,
  borderStyle: look.borderStyle,
});

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
      style={[styles.tile, tileFrame(look)]}
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.top}>
        <Text style={[styles.label, { color: look.labelColor }]}>{label}</Text>
        <TileTag tag={tag} look={look} />
      </View>
      <TileReading
        value={value}
        unit={unit}
        look={look}
        valueSize={valueSize}
      />
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
});
