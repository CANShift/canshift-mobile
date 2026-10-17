import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UiColors } from "../../theme/ui-tokens";

export interface FlowFrameProps {
  title: string;
  children?: ReactNode;
  footer: ReactNode;
}

export const FlowFrame = ({ title, children, footer }: FlowFrameProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
      ]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {children}
      </ScrollView>
      <View style={styles.footer}>{footer}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: UiColors.bg, paddingHorizontal: 20 },
  content: { gap: 14, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: "700", color: UiColors.text },
  footer: { gap: 10 },
});
