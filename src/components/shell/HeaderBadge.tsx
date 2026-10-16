import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import type { HeaderBadge as Badge } from "../../lib/link-presentation";

const BADGE_HEIGHT = 28;
const BADGE_TEXT_SIZE = 12;
const BADGE_TRACKING = BADGE_TEXT_SIZE * 0.06;
const LOGGING_DOT = 8;

const LoggingBadge = () => (
  <View style={[styles.badge, styles.logging]}>
    <View style={styles.loggingDot} />
    <Text style={[styles.text, styles.loggingText]}>
      {STRINGS.badges.logging}
    </Text>
  </View>
);

const DemoBadge = () => (
  <View style={[styles.badge, styles.demo]}>
    <Text style={[styles.text, styles.demoText]}>{STRINGS.badges.demo}</Text>
  </View>
);

const BADGES: Record<Badge, () => React.JSX.Element | null> = {
  logging: LoggingBadge,
  demo: DemoBadge,
  none: () => null,
};

export interface HeaderBadgeProps {
  badge: Badge;
}

export const HeaderBadge = ({ badge }: HeaderBadgeProps) => {
  const Rendered = BADGES[badge];
  return <Rendered />;
};

const styles = StyleSheet.create({
  badge: {
    height: BADGE_HEIGHT,
    paddingHorizontal: 10,
    borderRadius: BADGE_HEIGHT / 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logging: { backgroundColor: UiColors.dangerBg },
  demo: { borderWidth: 1.5, borderColor: UiColors.warning },
  loggingDot: {
    width: LOGGING_DOT,
    height: LOGGING_DOT,
    borderRadius: LOGGING_DOT / 2,
    backgroundColor: UiColors.accent,
  },
  text: {
    fontSize: BADGE_TEXT_SIZE,
    fontWeight: "700",
    letterSpacing: BADGE_TRACKING,
  },
  loggingText: { color: UiColors.dangerLabel },
  demoText: { color: UiColors.warning },
});
