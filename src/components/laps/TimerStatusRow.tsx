import { StyleSheet, Text, View } from "react-native";
import { STRINGS } from "../../strings";
import { UiColors } from "../../theme/ui-tokens";
import type { TimerView, TimerSource } from "../../lib/timer-view";
import { StatusTag } from "./StatusTag";

export interface TimerStatusRowProps {
  view: TimerView;
  source: TimerSource;
  lapNumber: number | null;
}

export const TimerStatusRow = ({
  view,
  source,
  lapNumber,
}: TimerStatusRowProps) => (
  <View style={styles.row}>
    <StatusTag
      label={view.tag}
      tone={view.tagTone}
      {...(view.tagGlyph === undefined ? {} : { glyph: view.tagGlyph })}
    />
    <StatusTag
      label={source.label}
      tone={source.tone}
      {...(source.glyph === undefined ? {} : { glyph: source.glyph })}
    />
    {lapNumber === null ? null : (
      <Text style={styles.lap}>{STRINGS.laps.lapNumber(lapNumber)}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    paddingTop: 6,
  },
  lap: {
    marginLeft: "auto",
    fontSize: 18,
    fontWeight: "700",
    color: UiColors.text,
  },
});
