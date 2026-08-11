import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Spacing } from "../../theme";
import { SIGNAL_META, type SignalKey } from "../../constants/ble";
import { useSignalValue, useSignalsIsLive } from "../../stores/signals.store";
import { GaugeWidget, GearWidget } from "../widgets";

const KICKER_SIZE = 10;

export interface PrimaryGaugeProps {
  signalKey: SignalKey;
  size: number;
  dayMode: boolean;
}

export const PrimaryGauge = ({
  signalKey,
  size,
  dayMode,
}: PrimaryGaugeProps) => {
  const value = useSignalValue(signalKey);
  const isLive = useSignalsIsLive();
  const liveValue = isLive ? value : undefined;
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>
        {SIGNAL_META[signalKey].label.toUpperCase()}
      </Text>
      {signalKey === "g" ? (
        <GearWidget
          signalKey={signalKey}
          value={liveValue}
          size={size}
          dayMode={dayMode}
        />
      ) : (
        <GaugeWidget
          signalKey={signalKey}
          value={liveValue}
          size={size}
          dayMode={dayMode}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "flex-start",
    borderTopWidth: 2,
    borderTopColor: Colors.text,
    paddingTop: Spacing.xs,
  },
  kicker: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: KICKER_SIZE,
    letterSpacing: KICKER_SIZE * 0.18,
    color: Colors.textDim,
    marginBottom: Spacing.xs,
  },
});
