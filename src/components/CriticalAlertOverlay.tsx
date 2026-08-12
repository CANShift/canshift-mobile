import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import { sensorDefaultDangerThreshold } from "@canshift/core";
import {
  Colors,
  Typography,
  Spacing,
  Fonts,
  TabularNums,
  SCREEN_PADDING,
} from "../theme";
import { SIGNAL_META, type SignalKey } from "../constants/ble";
import { signalKeyToSensorKind } from "../theme/signal-colors";
import { fromSensorKindValue } from "../theme/sensor-units";
import { useSignalsStore, useSignalsIsLive } from "../stores/signals.store";
import { useCriticalAlertStore } from "../stores/critical-alert.store";
import { selectCriticalAlert } from "../lib/critical-alert";
import { useSecondsSince } from "../hooks/use-seconds-since";
import { formatWidgetValue } from "./widgets/widget-value";

const PULSE_MIN_OPACITY = 0.35;
const PULSE_HALF_PERIOD_MS = 450;
const WHITE_50 = "rgba(255,255,255,0.5)";
const WHITE_70 = "rgba(255,255,255,0.7)";
const NAME_SIZE = 26;
const VALUE_SIZE = 132;
const STOP_SIZE = 24;

const thresholdText = (key: SignalKey): string => {
  const kind = signalKeyToSensorKind(key);
  const meta = SIGNAL_META[key];
  if (kind === undefined) return "Out of the safe range";
  const danger = sensorDefaultDangerThreshold(kind);
  const limit = danger.invertLogic ? "minimum" : "maximum";
  const value = formatWidgetValue(
    fromSensorKindValue(key, danger.threshold),
    meta.decimals,
  );
  return meta.unit === ""
    ? `${limit} ${value}`
    : `${meta.unit} — ${limit} ${value}`;
};

export const CriticalAlertOverlay = () => {
  const values = useSignalsStore((s) => s.values);
  const isLive = useSignalsIsLive();
  const { mutedKeys, acknowledgedKey, mute, acknowledge, clearAcknowledged } =
    useCriticalAlertStore(
      useShallow((s) => ({
        mutedKeys: s.mutedKeys,
        acknowledgedKey: s.acknowledgedKey,
        mute: s.mute,
        acknowledge: s.acknowledge,
        clearAcknowledged: s.clearAcknowledged,
      })),
    );

  const muted = useMemo(() => new Set(mutedKeys), [mutedKeys]);
  const alert = isLive ? selectCriticalAlert(values, muted) : null;
  const alertKey = alert?.key ?? null;
  const active = alert !== null && alert.key !== acknowledgedKey ? alert : null;
  const activeKey = active?.key ?? null;
  const sinceSeconds = useSecondsSince(activeKey);

  useEffect(() => {
    if (acknowledgedKey !== null && alertKey !== acknowledgedKey) {
      clearAcknowledged();
    }
  }, [alertKey, acknowledgedKey, clearAcknowledged]);

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (activeKey === null) return;
    pulse.setValue(1);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: PULSE_MIN_OPACITY,
          duration: PULSE_HALF_PERIOD_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: PULSE_HALF_PERIOD_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [activeKey, pulse]);

  if (active === null) return null;

  const meta = SIGNAL_META[active.key];
  const rpm = values.r;

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: Colors.danger, opacity: pulse },
        ]}
      />
      <SafeAreaView style={styles.safe}>
        <View
          style={styles.body}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          accessibilityLabel={`Critical: ${meta.label} ${thresholdText(active.key)}`}
        >
          <Text style={styles.name}>{meta.label.toUpperCase()}</Text>
          <Text style={styles.value} adjustsFontSizeToFit numberOfLines={1}>
            {formatWidgetValue(active.value, meta.decimals)}
          </Text>
          <Text style={styles.threshold}>{thresholdText(active.key)}</Text>
          <View style={styles.contextTable}>
            {rpm !== undefined && (
              <View style={styles.contextRow}>
                <Text style={styles.contextLabel}>RPM</Text>
                <Text style={styles.contextValue}>
                  {formatWidgetValue(rpm, 0)}
                </Text>
              </View>
            )}
            <View style={styles.contextRow}>
              <Text style={styles.contextLabel}>SINCE</Text>
              <Text style={styles.contextValue}>{String(sinceSeconds)} s</Text>
            </View>
          </View>
          <Text style={styles.stop}>Stop the engine</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            style={styles.ackBtn}
            onPress={() => {
              acknowledge(active.key);
            }}
            accessibilityRole="button"
            accessibilityLabel="Acknowledge alert"
          >
            <Text style={styles.ackText}>Acknowledge</Text>
          </Pressable>
          <Pressable
            style={styles.muteBtn}
            onPress={() => {
              mute(active.key);
            }}
            accessibilityRole="button"
            accessibilityLabel="Mute for this session"
          >
            <Text style={styles.muteText}>Mute for this session</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, elevation: 100 },
  safe: { flex: 1 },
  body: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 26,
  },
  name: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: NAME_SIZE,
    letterSpacing: NAME_SIZE * 0.16,
    textTransform: "uppercase",
    color: Colors.text,
  },
  value: {
    fontFamily: Fonts.mono,
    fontVariant: TabularNums,
    fontSize: VALUE_SIZE,
    lineHeight: VALUE_SIZE * 0.95,
    letterSpacing: VALUE_SIZE * -0.05,
    color: Colors.text,
    marginTop: 10,
  },
  threshold: {
    fontFamily: Fonts.mono,
    fontSize: 20,
    color: Colors.text,
    marginTop: 6,
  },
  contextTable: {
    marginTop: 32,
    borderTopWidth: 2,
    borderTopColor: WHITE_50,
    paddingTop: 14,
    gap: 10,
  },
  contextRow: { flexDirection: "row", justifyContent: "space-between" },
  contextLabel: {
    fontFamily: Fonts.mono,
    fontSize: Typography.md,
    color: Colors.text,
    opacity: 0.8,
  },
  contextValue: {
    fontFamily: Fonts.mono,
    fontVariant: TabularNums,
    fontSize: Typography.md,
    color: Colors.text,
  },
  stop: {
    marginTop: "auto",
    marginBottom: Spacing.lg,
    fontFamily: Fonts.uiExtraBold,
    fontSize: STOP_SIZE,
    letterSpacing: STOP_SIZE * 0.14,
    textTransform: "uppercase",
    color: Colors.text,
  },
  actions: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 30,
    gap: 12,
  },
  ackBtn: {
    height: 64,
    backgroundColor: Colors.text,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  ackText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.md,
    letterSpacing: Typography.md * 0.09,
    textTransform: "uppercase",
    color: Colors.danger,
  },
  muteBtn: {
    height: 56,
    borderWidth: 2,
    borderColor: WHITE_70,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  muteText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.sm,
    letterSpacing: Typography.sm * 0.08,
    textTransform: "uppercase",
    color: Colors.text,
  },
});
