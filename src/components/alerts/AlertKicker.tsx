import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import { Glyph } from "../icons/Glyph";

export interface AlertKickerProps {
  count: number;
  fromDash: boolean;
}

const Trailing = ({ count, fromDash }: AlertKickerProps) => {
  if (count > 1)
    return <Text style={styles.pill}>{STRINGS.alert.count(count)}</Text>;
  return fromDash ? (
    <Text style={styles.from}>{STRINGS.alert.fromDash}</Text>
  ) : null;
};

export const AlertKicker = (props: AlertKickerProps) => (
  <View style={styles.row}>
    <Glyph
      name="frame"
      size={26}
      color={UiColors.onPrimary}
      strokeWidth={2.4}
    />
    <Text style={styles.kicker}>{STRINGS.alert.kicker}</Text>
    <Trailing {...props} />
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  kicker: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: UiColors.onPrimary,
  },
  from: { fontSize: 15, fontWeight: "600", color: UiColors.onPrimary },
  pill: {
    height: 30,
    lineHeight: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: UiColors.onPrimary,
    color: UiColors.alertPillText,
    fontSize: 15,
    fontWeight: "800",
  },
});
