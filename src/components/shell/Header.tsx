import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UiColors } from "../../theme/ui-tokens";
import type { Link } from "../../lib/link-model";
import {
  LINK_PRESENTATION,
  type HeaderBadge as Badge,
} from "../../lib/link-presentation";
import { LinkDot } from "./LinkDot";
import { HeaderBadge } from "./HeaderBadge";

const HEADER_HEIGHT = 56;
const DOT_SIZE = 10;
const LABEL_SIZE = 16;
const NAME_SIZE = 14;

export interface HeaderProps {
  link: Link;
  dashName: string | null;
  badge: Badge;
}

export const Header = ({ link, dashName, badge }: HeaderProps) => {
  const insets = useSafeAreaInsets();
  const look = LINK_PRESENTATION[link];
  return (
    <View
      style={[styles.header, { paddingTop: insets.top }]}
      accessibilityRole="header"
    >
      <View style={styles.row}>
        <LinkDot
          color={look.dotColor}
          filled={look.dotFilled}
          size={DOT_SIZE}
        />
        <Text style={[styles.label, { color: look.labelColor }]}>
          {look.label}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {dashName === null ? "" : `· ${dashName}`}
        </Text>
        <HeaderBadge badge={badge} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: UiColors.bg,
    borderBottomWidth: 1,
    borderBottomColor: UiColors.border,
  },
  row: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: { fontSize: LABEL_SIZE, fontWeight: "700" },
  name: { flex: 1, fontSize: NAME_SIZE, color: UiColors.textMuted },
});
