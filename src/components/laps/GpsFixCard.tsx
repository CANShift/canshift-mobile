import { Linking, StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import {
  TouchTarget,
  UiColors,
  UiFonts,
  UiRadius,
} from "../../theme/ui-tokens";
import {
  GPS_READY_ACCURACY_M,
  fixProgress,
  type GpsFix,
} from "../../lib/gps-fix";
import { Glyph } from "../icons/Glyph";
import { BigButton } from "../buttons/BigButton";

export interface GpsFixCardProps {
  fix: GpsFix;
  accuracyM: number | null;
}

const openSettings = () => {
  void Linking.openSettings();
};

const ReadyCard = ({ accuracyM }: GpsFixCardProps) => (
  <View style={[styles.card, styles.ready, styles.row]}>
    <Glyph name="target" size={28} color={UiColors.success} strokeWidth={2} />
    <Text style={styles.readyTitle}>{STRINGS.laps.gpsReady}</Text>
    <Text style={styles.readyAccuracy}>
      {STRINGS.laps.accuracyShort(Math.round(accuracyM ?? 0))}
    </Text>
  </View>
);

const WaitingCard = ({ accuracyM }: GpsFixCardProps) => (
  <View style={[styles.card, styles.waiting]} accessibilityLiveRegion="polite">
    <View style={styles.row}>
      <Glyph name="target" size={28} color={UiColors.warning} strokeWidth={2} />
      <Text style={styles.waitingTitle}>{STRINGS.laps.waitingForGps}</Text>
    </View>
    {accuracyM === null ? null : (
      <Text style={styles.waitingBody}>
        {STRINGS.laps.accuracy(Math.round(accuracyM), GPS_READY_ACCURACY_M)}
      </Text>
    )}
    <View style={styles.track}>
      <View style={[styles.fill, { flex: fixProgress(accuracyM) }]} />
    </View>
    <Text style={styles.waitingBody}>{STRINGS.laps.openSky}</Text>
  </View>
);

const DeniedCard = () => (
  <View style={[styles.card, styles.waiting]}>
    <Text style={styles.waitingTitle}>{STRINGS.laps.locationOffTitle}</Text>
    <Text style={styles.waitingBody}>{STRINGS.laps.locationOffBody}</Text>
    <BigButton
      label={STRINGS.laps.openSettings}
      tone="outline"
      height={TouchTarget.driving}
      onPress={openSettings}
    />
  </View>
);

const CARDS: Record<GpsFix, (props: GpsFixCardProps) => React.JSX.Element> = {
  ready: ReadyCard,
  weak: WaitingCard,
  searching: WaitingCard,
  denied: DeniedCard,
};

export const GpsFixCard = (props: GpsFixCardProps) => {
  const Card = CARDS[props.fix];
  return <Card {...props} />;
};

const styles = StyleSheet.create({
  card: { borderRadius: UiRadius.card, padding: 18, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  ready: { backgroundColor: UiColors.successBg, paddingVertical: 16 },
  readyTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: UiColors.successText,
  },
  readyAccuracy: {
    fontSize: 16,
    fontFamily: UiFonts.numeric,
    color: UiColors.successText,
  },
  waiting: { backgroundColor: UiColors.warningBg },
  waitingTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: UiColors.warningTextStrong,
  },
  waitingBody: { fontSize: 16, lineHeight: 23, color: UiColors.warningText },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    flexDirection: "row",
    backgroundColor: UiColors.warningBorder,
  },
  fill: { backgroundColor: UiColors.warning },
});
