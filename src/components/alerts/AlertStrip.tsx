import { Pressable, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiRadius } from "../../theme/ui-tokens";
import { alertActions } from "../../services/alert-actions";
import { alertStripLine } from "../../lib/alert-text";
import type { AlertStripItem, StripKind } from "../../lib/alert-views";
import { useAlertViews } from "../../hooks/use-alerts";
import { Glyph, type GlyphName } from "../icons/Glyph";

const STRIP_HEIGHT = 68;

interface StripLook {
  glyph: GlyphName;
  status: string;
  action: string;
  onAction: (item: AlertStripItem) => void;
}

const STRIP_LOOKS: Record<StripKind, StripLook> = {
  acknowledged: {
    glyph: "frame",
    status: STRINGS.alert.stripAcknowledgedActive,
    action: STRINGS.alert.show,
    onAction: (item) => {
      alertActions.show(item.entry.source);
    },
  },
  muted: {
    glyph: "mute",
    status: STRINGS.alert.stripMutedActive,
    action: STRINGS.alert.unmute,
    onAction: (item) => {
      alertActions.unmute(item.entry.source);
    },
  },
};

const StripRow = ({ item }: { item: AlertStripItem }) => {
  const look = STRIP_LOOKS[item.kind];
  return (
    <View style={styles.row} accessibilityRole="alert">
      <Glyph
        name={look.glyph}
        size={24}
        color={UiColors.onPrimary}
        strokeWidth={2.2}
      />
      <View style={styles.copy}>
        <Text style={styles.line} numberOfLines={1}>
          {alertStripLine(item.entry)}
        </Text>
        <Text style={styles.status}>{look.status}</Text>
      </View>
      <Pressable
        style={styles.action}
        onPress={() => {
          look.onAction(item);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${look.action}, ${alertStripLine(item.entry)}`}
      >
        <Text style={styles.actionText}>{look.action}</Text>
      </Pressable>
    </View>
  );
};

export const AlertStrip = () => (
  <View>
    {useAlertViews().strips.map((item) => (
      <StripRow key={item.entry.source} item={item} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    minHeight: STRIP_HEIGHT,
    paddingLeft: 14,
    paddingRight: 8,
    backgroundColor: UiColors.primaryBtn,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  copy: { flex: 1, minWidth: 0 },
  line: { fontSize: 16, fontWeight: "800", color: UiColors.onPrimary },
  status: { fontSize: 13, fontWeight: "600", color: UiColors.onPrimary },
  action: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: UiRadius.control,
    backgroundColor: UiColors.onPrimary,
    justifyContent: "center",
  },
  actionText: { fontSize: 15, fontWeight: "800", color: UiColors.bg },
});
