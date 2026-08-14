import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, HitSlop, Spacing } from "../../theme";

export interface ConsoleEmptyAction {
  label: string;
  onPress: () => void;
}

export interface ConsoleEmptyProps {
  children: string;
  action?: ConsoleEmptyAction | undefined;
  footer?: string | undefined;
}

const PLANCHE_SCALE = 1.3;
const scaled = (planchePx: number): number =>
  Math.round(planchePx * PLANCHE_SCALE);

const MESSAGE_TOP = scaled(36);
const MESSAGE_SIZE = scaled(15);
const MESSAGE_LEADING = 1.7;
const MESSAGE_LINE_HEIGHT = Math.round(MESSAGE_SIZE * MESSAGE_LEADING);
const ACTION_TOP = scaled(20);
const ACTION_BORDER = 2;
const ACTION_PADDING_Y = scaled(14);
const ACTION_PADDING_X = scaled(16);
const ACTION_SIZE = scaled(12);
const ACTION_TRACKING_EM = 0.09;
const FOOTER_SIZE = scaled(12);

export const ConsoleEmpty = ({
  children,
  action,
  footer,
}: ConsoleEmptyProps) => (
  <View style={styles.container}>
    <Text style={styles.message}>{children}</Text>
    {action && (
      <Pressable
        style={styles.action}
        onPress={action.onPress}
        hitSlop={HitSlop.vertical}
        accessibilityRole="button"
        accessibilityLabel={action.label}
      >
        <Text style={styles.actionLabel}>{action.label}</Text>
      </Pressable>
    )}
    {footer !== undefined && <Text style={styles.footer}>{footer}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  message: {
    marginTop: MESSAGE_TOP,
    fontFamily: Fonts.mono,
    fontSize: MESSAGE_SIZE,
    lineHeight: MESSAGE_LINE_HEIGHT,
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  action: {
    marginTop: ACTION_TOP,
    alignSelf: "flex-start",
    borderWidth: ACTION_BORDER,
    borderColor: Colors.text,
    paddingVertical: ACTION_PADDING_Y,
    paddingHorizontal: ACTION_PADDING_X,
  },
  actionLabel: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: ACTION_SIZE,
    letterSpacing: ACTION_SIZE * ACTION_TRACKING_EM,
    color: Colors.text,
  },
  footer: {
    marginTop: "auto",
    fontFamily: Fonts.mono,
    fontSize: FOOTER_SIZE,
    color: Colors.textMuted,
  },
});
