import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors, UiFonts } from "../../theme/ui-tokens";
import { formatElapsed } from "../../lib/logging-status";
import { SurfaceCard } from "../cards/SurfaceCard";
import { BigButton } from "../buttons/BigButton";

const BUTTON_HEIGHT = 56;

export interface LoggingCardProps {
  logging: boolean;
  elapsedMs: number;
  onStart: () => void;
  onStop: () => void;
}

const LoggingOn = ({ elapsedMs, onStop }: LoggingCardProps) => (
  <SurfaceCard tone="danger">
    <View style={styles.head}>
      <View style={styles.badge}>
        <View style={styles.dot} />
        <Text style={styles.badgeText}>{STRINGS.badges.logging}</Text>
      </View>
      <Text style={styles.elapsed}>{formatElapsed(elapsedMs)}</Text>
    </View>
    <BigButton
      label={STRINGS.device.stopLogging}
      tone="light"
      height={BUTTON_HEIGHT}
      onPress={onStop}
    />
  </SurfaceCard>
);

const LoggingOff = ({ onStart }: LoggingCardProps) => (
  <SurfaceCard>
    <View style={styles.head}>
      <Text style={styles.title}>{STRINGS.device.loggingTitle}</Text>
      <Text style={styles.off}>{STRINGS.device.loggingOff}</Text>
    </View>
    <BigButton
      label={STRINGS.device.startLogging}
      tone="primary"
      height={BUTTON_HEIGHT}
      onPress={onStart}
    />
  </SurfaceCard>
);

export const LoggingCard = (props: LoggingCardProps) =>
  props.logging ? <LoggingOn {...props} /> : <LoggingOff {...props} />;

const styles = StyleSheet.create({
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 17, fontWeight: "600", color: UiColors.text },
  off: { fontSize: 14, color: UiColors.textMuted },
  badge: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: UiColors.accent,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.9,
    color: UiColors.dangerLabel,
  },
  elapsed: {
    fontSize: 22,
    fontFamily: UiFonts.numeric,
    fontWeight: "700",
    color: UiColors.text,
  },
});
