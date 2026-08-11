import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  Colors,
  Typography,
  Fonts,
  Spacing,
  HitSlop,
  SCREEN_PADDING,
} from "../../theme";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

const WINDOW_OPTIONS = [
  { label: "30s", value: 30, accessibilityLabel: "30 second window" },
  { label: "1m", value: 60, accessibilityLabel: "1 minute window" },
  { label: "2m", value: 120, accessibilityLabel: "2 minute window" },
];

const ACTIVE_UNDERLINE = 3;

interface GraphControlsProps {
  paused: boolean;
  windowSecs: number;
  onTogglePause: () => void;
  onSetWindow: (s: number) => void;
  onClear: () => void;
}

export const GraphControls = ({
  paused,
  windowSecs,
  onTogglePause,
  onSetWindow,
  onClear,
}: GraphControlsProps) => {
  const [confirmVisible, setConfirmVisible] = useState(false);
  return (
    <View style={styles.controls}>
      <TouchableOpacity
        style={styles.action}
        onPress={onTogglePause}
        hitSlop={HitSlop.vertical}
        accessibilityRole="button"
        accessibilityLabel={paused ? "Resume graph" : "Pause graph"}
      >
        <Text style={[styles.actionText, paused && styles.actionTextEngaged]}>
          {paused ? "Resume" : "Pause"}
        </Text>
      </TouchableOpacity>
      <View style={styles.windowRow}>
        {WINDOW_OPTIONS.map((opt) => {
          const active = windowSecs === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.windowBtn, active && styles.windowBtnActive]}
              onPress={() => {
                onSetWindow(opt.value);
              }}
              hitSlop={HitSlop.vertical}
              accessibilityRole="button"
              accessibilityLabel={opt.accessibilityLabel}
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[styles.windowText, active && styles.windowTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        style={[styles.action, styles.clearBtn]}
        onPress={() => {
          setConfirmVisible(true);
        }}
        hitSlop={HitSlop.vertical}
        accessibilityRole="button"
        accessibilityLabel="Clear graph data"
      >
        <Text style={styles.clearText}>Clear</Text>
      </TouchableOpacity>

      <AlertDialog open={confirmVisible} onOpenChange={setConfirmVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear graph data?</AlertDialogTitle>
            <AlertDialogDescription>
              This wipes the telemetry buffer shared with the Dash screen and
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onPress={onClear}>Clear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingHorizontal: SCREEN_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ruleHair,
    gap: Spacing.md,
  },
  action: { minHeight: 44, justifyContent: "center" },
  actionText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: Colors.textDim,
  },
  actionTextEngaged: { color: Colors.accent },
  windowRow: { flexDirection: "row", gap: Spacing.sm },
  windowBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: ACTIVE_UNDERLINE,
    borderBottomColor: "transparent",
  },
  windowBtnActive: { borderBottomColor: Colors.accent },
  windowText: {
    fontFamily: Fonts.mono,
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  windowTextActive: { color: Colors.text },
  clearBtn: { marginLeft: "auto" },
  clearText: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.xs,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: Colors.textMuted,
  },
});
