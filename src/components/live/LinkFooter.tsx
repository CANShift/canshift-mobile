import { StyleSheet, Text, View } from "react-native";
import { UiColors } from "../../theme/ui-tokens";
import { useLiveFooter } from "../../hooks/use-live-footer";
import { LinkDot } from "../shell/LinkDot";
import { DisplayButton } from "./DisplayButton";

const FOOTER_HEIGHT = 56;
const DOT_SIZE = 8;

export interface LinkFooterProps {
  onDisplay: () => void;
}

export const LinkFooter = ({ onDisplay }: LinkFooterProps) => {
  const { look, text } = useLiveFooter();
  return (
    <View style={styles.footer}>
      <LinkDot color={look.dotColor} filled={look.dotFilled} size={DOT_SIZE} />
      <Text style={styles.text} numberOfLines={2}>
        {text}
      </Text>
      {look.showsDisplay ? <DisplayButton onPress={onDisplay} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    minHeight: FOOTER_HEIGHT,
    paddingLeft: 16,
    paddingRight: 8,
    borderTopWidth: 1,
    borderTopColor: UiColors.borderRow,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: { flex: 1, fontSize: 14, color: UiColors.textSecondary },
});
