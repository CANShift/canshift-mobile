import React from "react";
import { Animated, View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, TabularNums } from "../theme";
import { usePulseOpacity } from "../hooks/use-pulse-opacity";
import { useCriticalAlert } from "../hooks/use-critical-alert";
import { criticalAlertControl } from "../services/critical-alert-control";

const PULSE_MIN_OPACITY = 0.4;
const PULSE_HALF_PERIOD_MS = 1000;
const WHITE_50 = "rgba(255,255,255,0.5)";
const WHITE_70 = "rgba(255,255,255,0.7)";
const WHITE_85 = "rgba(255,255,255,0.85)";
const FIELD_PADDING = 26;
const NAME_SIZE = 22;
const VALUE_SIZE = 120;
const ROW_SIZE = 16;
const STOP_SIZE = 20;
const ACTION_SIZE = 17;

export const CriticalAlertOverlay = () => {
  const alert = useCriticalAlert();
  const pulse = usePulseOpacity(
    alert !== null,
    PULSE_MIN_OPACITY,
    PULSE_HALF_PERIOD_MS,
  );

  if (alert === null) return null;

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <Animated.View style={[styles.field, { opacity: pulse }]}>
        <SafeAreaView style={styles.safe}>
          <View
            style={styles.body}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            accessibilityLabel={`Critical: ${alert.name} ${alert.value} — ${alert.threshold}`}
          >
            <Text style={styles.name}>{alert.name}</Text>
            <Text style={styles.value} adjustsFontSizeToFit numberOfLines={1}>
              {alert.value}
            </Text>
            <Text style={styles.threshold}>{alert.threshold}</Text>
            <View style={styles.table}>
              {alert.rows.map((row) => (
                <View key={row.label} style={styles.row}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.actions}>
              <Text style={styles.stop}>STOP THE ENGINE</Text>
              <Pressable
                style={styles.ackButton}
                onPress={() => {
                  criticalAlertControl.acknowledge(alert.key);
                }}
                accessibilityRole="button"
                accessibilityLabel="Acknowledge"
              >
                <Text style={styles.ackLabel}>ACKNOWLEDGE</Text>
              </Pressable>
              <Pressable
                style={styles.muteButton}
                onPress={() => {
                  criticalAlertControl.mute(alert.key);
                }}
                accessibilityRole="button"
                accessibilityLabel="Mute for this session"
              >
                <Text style={styles.muteLabel}>MUTE FOR THIS SESSION</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
    backgroundColor: Colors.bg,
  },
  field: { flex: 1, backgroundColor: Colors.danger },
  safe: { flex: 1 },
  body: { flex: 1, padding: FIELD_PADDING },
  name: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: NAME_SIZE,
    letterSpacing: NAME_SIZE * 0.16,
    color: Colors.text,
    marginTop: 47,
  },
  value: {
    fontFamily: Fonts.mono,
    fontVariant: TabularNums,
    fontSize: VALUE_SIZE,
    lineHeight: VALUE_SIZE * 0.9,
    color: Colors.text,
    marginTop: 13,
  },
  threshold: {
    fontFamily: Fonts.mono,
    fontSize: 17,
    color: WHITE_85,
    marginTop: 10,
  },
  table: {
    marginTop: 31,
    paddingTop: 18,
    borderTopWidth: 2,
    borderTopColor: WHITE_50,
    gap: 13,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: {
    fontFamily: Fonts.mono,
    fontSize: ROW_SIZE,
    color: WHITE_85,
  },
  rowValue: {
    fontFamily: Fonts.mono,
    fontVariant: TabularNums,
    fontSize: ROW_SIZE,
    color: WHITE_85,
  },
  actions: { marginTop: "auto", gap: 1 },
  stop: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: STOP_SIZE,
    letterSpacing: STOP_SIZE * 0.1,
    color: Colors.text,
    marginBottom: 16,
  },
  ackButton: {
    backgroundColor: Colors.text,
    paddingVertical: 21,
    paddingHorizontal: 23,
  },
  ackLabel: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: ACTION_SIZE,
    letterSpacing: ACTION_SIZE * 0.09,
    color: Colors.danger,
  },
  muteButton: {
    borderWidth: 2,
    borderColor: WHITE_70,
    paddingVertical: 18,
    paddingHorizontal: 23,
  },
  muteLabel: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: ACTION_SIZE,
    letterSpacing: ACTION_SIZE * 0.09,
    color: Colors.text,
  },
});
