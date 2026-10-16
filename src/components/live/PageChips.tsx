import { Pressable, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { LIVE_PAGES } from "../../lib/live-tiles";

const CHIP_HEIGHT = 32;
const CHIP_HIT_SLOP = { top: 12, bottom: 12 };

export interface PageChipsProps {
  page: number;
  onSelect: (page: number) => void;
}

export const PageChips = ({ page, onSelect }: PageChipsProps) => (
  <View
    style={styles.row}
    accessibilityRole="tablist"
    accessibilityLabel={STRINGS.live.pages}
  >
    {LIVE_PAGES.map((livePage, index) => {
      const selected = index === page;
      return (
        <Pressable
          key={livePage.id}
          style={[styles.chip, selected ? styles.on : null]}
          onPress={() => {
            onSelect(index);
          }}
          hitSlop={CHIP_HIT_SLOP}
          accessibilityRole="tab"
          accessibilityState={{ selected }}
          accessibilityLabel={livePage.name}
        >
          <Text style={selected ? styles.onText : styles.offText}>
            {livePage.name}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", gap: 6 },
  chip: {
    height: CHIP_HEIGHT,
    paddingHorizontal: 10,
    borderRadius: CHIP_HEIGHT / 2,
    justifyContent: "center",
  },
  on: { backgroundColor: UiColors.surface2 },
  onText: { fontSize: 13, fontWeight: "700", color: UiColors.text },
  offText: { fontSize: 13, color: UiColors.textMuted },
});
