import { StyleSheet, View } from "react-native";
import { UiColors } from "../../theme/ui-tokens";

const SIZE = 240;
const RINGS = [
  { inset: 0, color: UiColors.borderRow, width: 1.5 },
  { inset: 40, color: UiColors.border, width: 1.5 },
  { inset: 80, color: UiColors.accent, width: 2 },
];
const DOT = 24;

export const ScanRadar = () => (
  <View
    style={styles.radar}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    {RINGS.map((ring) => (
      <View
        key={ring.inset}
        style={[
          styles.ring,
          {
            top: ring.inset,
            left: ring.inset,
            right: ring.inset,
            bottom: ring.inset,
            borderRadius: (SIZE - ring.inset * 2) / 2,
            borderColor: ring.color,
            borderWidth: ring.width,
          },
        ]}
      />
    ))}
    <View style={styles.dot} />
  </View>
);

const styles = StyleSheet.create({
  radar: { alignSelf: "center", width: SIZE, height: SIZE, marginTop: 16 },
  ring: { position: "absolute" },
  dot: {
    position: "absolute",
    left: (SIZE - DOT) / 2,
    top: (SIZE - DOT) / 2,
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: UiColors.accent,
  },
});
