import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Spacing } from "../../theme";
import { LINK_HOLD_POLICY_COPY } from "../../lib/link-hold";
import { useIsLinkLost } from "../../hooks/use-link-status";

const FOOTER_RULE = 2;
const FOOTER_PADDING_TOP = 14;
const FOOTER_TEXT_SIZE = 12;
const FOOTER_LINE_HEIGHT = FOOTER_TEXT_SIZE * 1.6;

export const DashLinkFooter = () => {
  const isLinkLost = useIsLinkLost();
  if (!isLinkLost) return null;

  return (
    <View style={styles.footer}>
      <Text style={styles.text}>{LINK_HOLD_POLICY_COPY}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: FOOTER_RULE,
    borderTopColor: Colors.border,
    paddingTop: FOOTER_PADDING_TOP,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  text: {
    fontFamily: Fonts.mono,
    fontSize: FOOTER_TEXT_SIZE,
    lineHeight: FOOTER_LINE_HEIGHT,
    color: Colors.textMuted,
  },
});
