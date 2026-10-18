import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { UiColors } from "../../theme/ui-tokens";

const TITLE_SIZE = 20;

interface BottomSheetHeadProps {
  title: string;
  subtitle?: string | undefined;
  accessory?: ReactNode;
}

export const BottomSheetHead = ({
  title,
  subtitle,
  accessory,
}: BottomSheetHeadProps) => (
  <View style={styles.head}>
    <View style={styles.titles}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle === undefined ? null : (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
    {accessory}
  </View>
);

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  titles: { flex: 1, gap: 2 },
  title: { fontSize: TITLE_SIZE, fontWeight: "700", color: UiColors.text },
  subtitle: { fontSize: 14, color: UiColors.textMuted },
});
