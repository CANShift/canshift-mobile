import { StyleSheet, View } from "react-native";
import { Spacing } from "../../theme";
import type { SignalKey } from "../../constants/ble";
import { SAFETY_SIGNALS, WARNING_CELL_SIZE } from "../../constants/dash-layout";
import { useSignalValue, useSignalsIsLive } from "../../stores/signals.store";
import { WarningWidget } from "../widgets";

const WarningCell = ({
  signalKey,
  dayMode,
}: {
  signalKey: SignalKey;
  dayMode: boolean;
}) => {
  const value = useSignalValue(signalKey);
  const isLive = useSignalsIsLive();
  return (
    <WarningWidget
      signalKey={signalKey}
      value={isLive ? value : undefined}
      size={WARNING_CELL_SIZE}
      dayMode={dayMode}
    />
  );
};

export const WarningStrip = ({ dayMode }: { dayMode: boolean }) => (
  <View style={styles.strip}>
    {SAFETY_SIGNALS.map((key) => (
      <WarningCell key={key} signalKey={key} dayMode={dayMode} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "flex-end",
  },
});
