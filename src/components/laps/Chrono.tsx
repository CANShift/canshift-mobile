import { StyleSheet, Text } from "react-native";
import { UiColors, UiFonts } from "../../theme/ui-tokens";
import { formatChrono } from "../../lib/lap-time";

const CHRONO_SIZE = 78;

export interface ChronoProps {
  ms: number;
  color?: string;
}

export const Chrono = ({ ms, color = UiColors.text }: ChronoProps) => (
  <Text
    style={[styles.chrono, { color }]}
    numberOfLines={1}
    adjustsFontSizeToFit
    accessibilityRole="timer"
  >
    {formatChrono(ms)}
  </Text>
);

const styles = StyleSheet.create({
  chrono: {
    fontSize: CHRONO_SIZE,
    lineHeight: CHRONO_SIZE * 1.05,
    fontFamily: UiFonts.numeric,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
