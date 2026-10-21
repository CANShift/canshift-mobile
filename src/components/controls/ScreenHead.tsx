import { StyleSheet, Text, View } from "react-native";
import { UiColors } from "../../theme/ui-tokens";
import { BackRow } from "./BackRow";

export interface ScreenHeadProps {
  title: string;
  backLabel: string;
  onBack: () => void;
}

export const ScreenHead = ({ title, backLabel, onBack }: ScreenHeadProps) => (
  <View style={styles.head}>
    <BackRow label={backLabel} onPress={onBack} />
    <Text style={styles.title} accessibilityRole="header">
      {title}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "700", color: UiColors.text },
});
