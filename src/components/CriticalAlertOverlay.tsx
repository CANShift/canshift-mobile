import React, { useEffect, useMemo, useRef } from "react";
import { Animated, View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import { TriangleAlert } from "lucide-react-native";
import {
  WIDGET_ZONE_COLORS,
  sensorDefaultDangerThreshold,
} from "@canshift/core";
import { Typography, Spacing, Radius, Fonts } from "../theme";
import { SIGNAL_META, type SignalKey } from "../constants/ble";
import { signalKeyToSensorKind } from "../theme/signal-colors";
import { useSignalsStore, useSignalsIsLive } from "../stores/signals.store";
import { useCriticalAlertStore } from "../stores/critical-alert.store";
import { selectCriticalAlert } from "../lib/critical-alert";
import { formatWidgetValue } from "./widgets/widget-value";

const PULSE_MIN_OPACITY = 0.55;
const PULSE_HALF_PERIOD_MS = 450;

const contextText = (key: SignalKey): string => {
  const kind = signalKeyToSensorKind(key);
  if (kind === undefined) return "Out of the safe range";
  return sensorDefaultDangerThreshold(kind).invertLogic
    ? "Below the safe range"
    : "Above the safe range";
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
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: PULSE_HALF_PERIOD_MS,
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

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: WIDGET_ZONE_COLORS.danger, opacity: pulse },
        ]}
      />
      <SafeAreaView style={styles.safe}>
        <View
          style={styles.body}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          accessibilityLabel={`Critical: ${meta.label} ${contextText(active.key)}`}
        >
          <TriangleAlert color="#FFFFFF" size={64} />
          <Text style={styles.eyebrow}>Critical</Text>
          <Text style={styles.label}>{meta.label.toUpperCase()}</Text>
          <Text style={styles.value}>
            {formatWidgetValue(active.value, meta.decimals)}
            {meta.unit ? <Text style={styles.unit}> {meta.unit}</Text> : null}
          </Text>
          <Text style={styles.context}>{contextText(active.key)}</Text>
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
  safe: { flex: 1, justifyContent: "space-between" },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  eyebrow: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.sm,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: "#FFFFFF",
    marginTop: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.uiSemiBold,
    fontSize: Typography.lg,
    letterSpacing: 2,
    color: "#FFFFFF",
    textAlign: "center",
  },
  value: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: 72,
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
  },
  unit: { fontFamily: Fonts.uiSemiBold, fontSize: Typography.lg },
  context: {
    fontFamily: Fonts.ui,
    fontSize: Typography.md,
    color: "#FFFFFF",
    opacity: 0.85,
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  ackBtn: {
    minHeight: 64,
    borderRadius: Radius.md,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ackText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.md,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: WIDGET_ZONE_COLORS.danger,
  },
  muteBtn: {
    minHeight: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  muteText: {
    fontFamily: Fonts.uiSemiBold,
    fontSize: Typography.sm,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#FFFFFF",
  },
});
