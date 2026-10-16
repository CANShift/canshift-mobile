import { Pressable, StyleSheet, Text, View } from "react-native";
import { TouchTarget, UiColors, UiFonts } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";
import { SeriesSwatch } from "./SeriesSwatch";
import type { SeriesStyle } from "../../lib/graph-config";

const BOX = 26;

export interface PickerRowProps {
  name: string;
  value: string;
  checked: boolean;
  swatch: SeriesStyle | null;
  onPress: () => void;
}

export const PickerRow = ({
  name,
  value,
  checked,
  swatch,
  onPress,
}: PickerRowProps) => (
  <Pressable
    style={styles.row}
    onPress={onPress}
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
    accessibilityLabel={name}
  >
    <View style={[styles.box, checked ? styles.boxOn : styles.boxOff]}>
      {checked ? (
        <Glyph name="check" size={16} color={UiColors.bg} strokeWidth={3} />
      ) : null}
    </View>
    <Text style={styles.name}>{name}</Text>
    <Text style={styles.value}>{value}</Text>
    <View style={styles.swatch}>
      {swatch === null ? null : <SeriesSwatch series={swatch} />}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    minHeight: TouchTarget.driving,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: UiColors.borderRow,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  box: {
    width: BOX,
    height: BOX,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: UiColors.text },
  boxOff: { borderWidth: 2, borderColor: UiColors.borderStrong },
  name: { flex: 1, fontSize: 16, color: UiColors.text },
  value: {
    fontSize: 15,
    fontFamily: UiFonts.numeric,
    color: UiColors.textMuted,
  },
  swatch: { width: 18, height: 4 },
});
