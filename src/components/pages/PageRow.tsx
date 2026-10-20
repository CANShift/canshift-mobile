import { Pressable, StyleSheet, Text, View } from "react-native";
import { PAGES_STRINGS } from "../../pages-strings";
import {
  TouchTarget,
  UiColors,
  UiFonts,
  UiRadius,
} from "../../theme/ui-tokens";
import { LinkDot } from "../shell/LinkDot";

const ROW_HEIGHT = TouchTarget.driving + 8;
const DOT_SIZE = 8;

export interface PageRowProps {
  index: number;
  label: string;
  onScreen: boolean;
  selected: boolean;
  onPress: () => void;
}

const OnScreenTag = () => (
  <View style={styles.tag}>
    <LinkDot color={UiColors.success} filled size={DOT_SIZE} />
    <Text style={styles.tagText}>{PAGES_STRINGS.onScreen}</Text>
  </View>
);

export const PageRow = ({
  index,
  label,
  onScreen,
  selected,
  onPress,
}: PageRowProps) => (
  <Pressable
    style={[styles.row, selected ? styles.selected : null]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={
      onScreen ? `${label}, ${PAGES_STRINGS.onScreen}` : label
    }
    accessibilityState={{ selected }}
  >
    <Text style={styles.number}>{PAGES_STRINGS.pageNumber(index)}</Text>
    <Text style={styles.label} numberOfLines={1}>
      {label}
    </Text>
    {onScreen ? <OnScreenTag /> : null}
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    minHeight: ROW_HEIGHT,
    paddingHorizontal: 16,
    borderRadius: UiRadius.card,
    borderWidth: 1,
    borderColor: UiColors.border,
    backgroundColor: UiColors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  selected: { borderWidth: 2, borderColor: UiColors.text },
  number: {
    fontFamily: UiFonts.numeric,
    fontSize: 15,
    color: UiColors.textMuted,
  },
  label: { flex: 1, fontSize: 18, fontWeight: "600", color: UiColors.text },
  tag: { flexDirection: "row", alignItems: "center", gap: 6 },
  tagText: { fontSize: 14, color: UiColors.successText },
});
