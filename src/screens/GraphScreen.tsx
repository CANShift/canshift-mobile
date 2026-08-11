import { useState, useCallback } from "react";
import { Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../theme";
import {
  clearBuffer,
  getBufferCap,
  getRange,
  getWriteIndex,
} from "../stores/telemetry.store";
import { exportGraphCsv } from "../services/graph-export";
import DashTopBar from "../components/DashTopBar";
import {
  ChartPanel,
  type ChartPanelProps,
} from "../components/graph/ChartPanel";
import type { SignalKey } from "../constants/ble";
import { errText } from "../lib/error-text";

const DEFAULT_SIGNALS: SignalKey[] = ["r", "lam"];

export default function GraphScreen() {
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [windowSecs, setWindowSecs] = useState(30);
  const [visibleSignals, setVisibleSignals] =
    useState<SignalKey[]>(DEFAULT_SIGNALS);

  const handleTogglePause = useCallback(() => {
    setPausedAt((current) => (current === null ? Date.now() : null));
  }, []);

  const handleToggleSignal = useCallback((key: SignalKey) => {
    setVisibleSignals((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const handleExport = useCallback(async () => {
    const writeIndex = getWriteIndex();
    const from = Math.max(0, writeIndex - getBufferCap());
    const samples = getRange(from, writeIndex);
    if (samples.length === 0) {
      Alert.alert("Nothing to export", "No telemetry has been captured yet.");
      return;
    }
    try {
      await exportGraphCsv(samples, visibleSignals);
    } catch (err) {
      Alert.alert("Export failed", errText(err));
    }
  }, [visibleSignals]);

  const panelProps: ChartPanelProps = {
    visibleSignals,
    windowSecs,
    paused: pausedAt !== null,
    pausedAt: pausedAt ?? 0,
    onTogglePause: handleTogglePause,
    onSetWindow: setWindowSecs,
    onClear: clearBuffer,
    onExport: () => {
      void handleExport();
    },
    onToggleSignal: handleToggleSignal,
  };

  return (
    <SafeAreaView style={styles.container}>
      <DashTopBar />
      <ChartPanel {...panelProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
});
