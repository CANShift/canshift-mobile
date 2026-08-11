import { View, Text, StyleSheet } from "react-native";
import { useBatteryLevel } from "expo-battery";
import { Colors, Fonts, TabularNums, SCREEN_PADDING } from "../theme";
import { useClockMinute } from "../hooks/use-clock-minute";

const ROW_HEIGHT = 54;
const TEXT_SIZE = 13;
const LEVEL_UNKNOWN = -1;

const batteryText = (level: number): string =>
  level <= LEVEL_UNKNOWN ? "" : `${String(Math.round(level * 100))} %`;

export const StatusRow = () => {
  const time = useClockMinute();
  const battery = useBatteryLevel();

  return (
    <View style={styles.row}>
      <Text style={styles.cell}>{time}</Text>
      <Text style={[styles.cell, styles.center]}>CANShift</Text>
      <Text style={[styles.cell, styles.right]}>{batteryText(battery)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SCREEN_PADDING,
  },
  cell: {
    flex: 1,
    fontFamily: Fonts.mono,
    fontVariant: TabularNums,
    fontSize: TEXT_SIZE,
    color: Colors.textDim,
  },
  center: { textAlign: "center" },
  right: { textAlign: "right" },
});
