import { View, Text, StyleSheet } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { Colors, Fonts, TabularNums, SCREEN_PADDING } from "../../theme";
import { SIGNAL_META, type SignalKey } from "../../constants/ble";

export const STRIP_VIEW_WIDTH = 320;
export const STRIP_HEIGHT = 90;

const KICKER_SIZE = 10;
const KICKER_TRACKING = KICKER_SIZE * 0.18;
const VALUE_SIZE = 34;
const UNIT_SIZE = 14;
const TRACE_WIDTH = 2;

export interface SignalStripProps {
  signalKey: SignalKey;
  points: string;
  value: string;
  alarm: boolean;
  last: boolean;
}

export const SignalStrip = ({
  signalKey,
  points,
  value,
  alarm,
  last,
}: SignalStripProps) => {
  const ink = alarm ? Colors.danger : Colors.text;
  const meta = SIGNAL_META[signalKey];
  return (
    <View style={[styles.strip, !last && styles.stripRule]}>
      <Text style={[styles.kicker, alarm && { color: Colors.danger }]}>
        {meta.label}
      </Text>
      <Svg
        viewBox={`0 0 ${String(STRIP_VIEW_WIDTH)} ${String(STRIP_HEIGHT)}`}
        width="100%"
        height={STRIP_HEIGHT}
        preserveAspectRatio="none"
      >
        <Polyline
          points={points}
          fill="none"
          stroke={ink}
          strokeWidth={TRACE_WIDTH}
        />
      </Svg>
      <Text style={[styles.value, { color: ink }]}>
        {value}
        {meta.unit !== "" && <Text style={styles.unit}> {meta.unit}</Text>}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  strip: {
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 18,
    gap: 6,
  },
  stripRule: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.ruleHair,
  },
  kicker: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: KICKER_SIZE,
    letterSpacing: KICKER_TRACKING,
    textTransform: "uppercase",
    color: Colors.textDim,
  },
  value: {
    fontFamily: Fonts.mono,
    fontVariant: TabularNums,
    fontSize: VALUE_SIZE,
    lineHeight: VALUE_SIZE,
  },
  unit: {
    fontSize: UNIT_SIZE,
    color: Colors.textDim,
  },
});
