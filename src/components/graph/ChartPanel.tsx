import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors, Typography, Spacing, SCREEN_PADDING } from "../../theme";
import type { SignalKey } from "../../constants/ble";
import { buildPoints, formatNumber } from "../../lib/graph-math";
import type { SignalValues } from "../../stores/telemetry.store";
import { useGraphSeries } from "../../hooks/use-graph-series";
import { useCriticalAlertKey } from "../../hooks/use-critical-alert";
import { Button } from "../ui/button";
import { GraphControls } from "./GraphControls";
import { SignalStrip, STRIP_VIEW_WIDTH, STRIP_HEIGHT } from "./SignalStrip";
import { SignalPickerSheet } from "./SignalPickerSheet";

const ACTION_TEXT = "text-[13px] tracking-[1.04px]";

export interface ChartPanelProps {
  visibleSignals: SignalKey[];
  windowSecs: number;
  paused: boolean;
  pausedAt: number;
  onTogglePause: () => void;
  onSetWindow: (s: number) => void;
  onClear: () => void;
  onExport: () => void;
  onToggleSignal: (key: SignalKey) => void;
}

export const ChartPanel = ({
  visibleSignals,
  windowSecs,
  paused,
  pausedAt,
  onTogglePause,
  onSetWindow,
  onClear,
  onExport,
  onToggleSignal,
}: ChartPanelProps) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { rolling, windowStart, windowEnd, hasData } = useGraphSeries(
    windowSecs,
    paused,
    pausedAt,
  );
  const alarmKey = useCriticalAlertKey();
  const latest: SignalValues = rolling[rolling.length - 1]?.v ?? {};

  return (
    <>
      <GraphControls
        paused={paused}
        windowSecs={windowSecs}
        onTogglePause={onTogglePause}
        onSetWindow={onSetWindow}
        onClear={onClear}
      />

      {!hasData ? (
        <View style={styles.noDataOverlay}>
          <Text style={styles.noDataText}>No telemetry data yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.strips}>
          {visibleSignals.map((key, index) => (
            <SignalStrip
              key={key}
              signalKey={key}
              points={buildPoints(
                rolling,
                key,
                windowStart,
                windowEnd,
                STRIP_VIEW_WIDTH,
                STRIP_HEIGHT,
              )}
              value={formatNumber(key, latest[key])}
              alarm={key === alarmKey}
              last={index === visibleSignals.length - 1}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.actions}>
        <Button
          variant="outline"
          className="flex-1"
          textClassName={ACTION_TEXT}
          onPress={() => {
            setPickerOpen(true);
          }}
        >
          Pick signals
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          textClassName={ACTION_TEXT}
          onPress={onExport}
        >
          Export
        </Button>
      </View>

      <SignalPickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        visibleSignals={visibleSignals}
        onToggleSignal={onToggleSignal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  strips: { flex: 1 },
  noDataOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  noDataText: { color: Colors.textMuted, fontSize: Typography.sm },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: Spacing.lg,
  },
});
