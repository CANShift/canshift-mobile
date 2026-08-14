import { StyleSheet, Text, View } from "react-native";
import {
  Colors,
  Spacing,
  SCREEN_PADDING,
  SCREEN_RULE,
  footerNoteStyle,
} from "../../theme";
import { LINK_HOLD_POLICY_COPY } from "../../lib/link-hold";
import { useIsLinkLost } from "../../hooks/use-link-status";

const FOOTER_PADDING_TOP = 18;

export const DashLinkFooter = () => {
  const isLinkLost = useIsLinkLost();
  if (!isLinkLost) return null;

  return (
    <View style={styles.footer}>
      <View style={styles.rule}>
        <Text style={styles.text}>{LINK_HOLD_POLICY_COPY}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: Spacing.md,
  },
  rule: {
    borderTopWidth: SCREEN_RULE,
    borderTopColor: Colors.border,
    paddingTop: FOOTER_PADDING_TOP,
  },
  text: footerNoteStyle,
});
