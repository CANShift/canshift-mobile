import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Typography, Spacing } from "../../theme";

export interface ConsoleEmptyProps {
  title?: string;
  children: string;
}

export const ConsoleEmpty = ({ title, children }: ConsoleEmptyProps) => (
  <View style={styles.container}>
    {title !== undefined && <Text style={styles.title}>{title}</Text>}
    <Text style={styles.text}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.md,
    color: Colors.text,
  },
  text: {
    fontFamily: Fonts.ui,
    color: Colors.textMuted,
    fontSize: Typography.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
