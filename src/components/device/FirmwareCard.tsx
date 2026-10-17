import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { TouchTarget, UiColors } from "../../theme/ui-tokens";
import { NO_VALUE } from "../../lib/tile-state";
import { SurfaceCard } from "../cards/SurfaceCard";
import { BigButton } from "../buttons/BigButton";
import type { FirmwareCardModel } from "../../hooks/use-firmware-card";

const F = STRINGS.firmware;

export type FirmwareCardProps = FirmwareCardModel;

interface VersionRowProps {
  label: string;
  value: string;
}

const VersionRow = ({ label, value }: VersionRowProps) => (
  <View style={styles.row} accessible>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export const FirmwareCard = ({
  running,
  latest,
  message,
  action,
  actionLabel,
  busy,
  onAction,
}: FirmwareCardProps) => (
  <SurfaceCard>
    <Text style={styles.title} accessibilityRole="header">
      {F.cardTitle}
    </Text>
    <VersionRow label={F.onTheDash} value={running} />
    <VersionRow label={F.latest} value={latest ?? NO_VALUE} />
    <View style={styles.status} accessibilityLiveRegion="polite">
      {busy ? <ActivityIndicator color={UiColors.textMuted} /> : null}
      <Text style={styles.message}>{message}</Text>
    </View>
    {action === null ? null : (
      <BigButton
        label={actionLabel}
        tone={action === "update" ? "primary" : "outline"}
        height={TouchTarget.driving}
        onPress={onAction}
      />
    )}
  </SurfaceCard>
);

const styles = StyleSheet.create({
  title: { fontSize: 17, fontWeight: "600", color: UiColors.text },
  row: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontSize: 15, color: UiColors.textMuted },
  value: { fontSize: 15, color: UiColors.text },
  status: { flexDirection: "row", alignItems: "center", gap: 8 },
  message: { flexShrink: 1, fontSize: 15, color: UiColors.textSecondary },
});
