import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";

export const GraphEmpty = () => (
  <View style={styles.card}>
    <Glyph
      name="chart"
      size={48}
      color={UiColors.textStale}
      strokeWidth={1.8}
    />
    <Text style={styles.title}>{STRINGS.graph.emptyTitle}</Text>
    <Text style={styles.body}>{STRINGS.graph.emptyBody}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 24,
    gap: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: UiRadius.card,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: UiColors.borderStrong,
    backgroundColor: UiColors.surface,
  },
  title: {
    fontSize: 19,
    fontWeight: "600",
    color: UiColors.text,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: UiColors.textMuted,
    textAlign: "center",
  },
});
