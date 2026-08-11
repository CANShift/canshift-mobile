import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Play, Search, Square } from "lucide-react-native";
import { Colors, Fonts, Typography, Spacing } from "../../theme";

const ACCENT_BAR_HEIGHT = 64;
const SECONDARY_ROW_HEIGHT = 56;

type ScanAction = "stop" | "rescan" | "scan";

const SCAN_ACTION_LABELS: Record<ScanAction, string> = {
  stop: "Stop scanning",
  rescan: "Scan again",
  scan: "Scan for devices",
};

export interface ScanFooterProps {
  scanning: boolean;
  hasScanned: boolean;
  disabled: boolean;
  onScanPress: () => void;
  onDemoPress: () => void;
}

export const ScanFooter = ({
  scanning,
  hasScanned,
  disabled,
  onScanPress,
  onDemoPress,
}: ScanFooterProps) => {
  const action: ScanAction = scanning ? "stop" : hasScanned ? "rescan" : "scan";
  const label = SCAN_ACTION_LABELS[action];
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.scanBar, disabled && styles.scanBarDisabled]}
        onPress={onScanPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        <Text style={styles.scanBarLabel}>{label}</Text>
        {action === "stop" ? (
          <Square size={18} color={Colors.bg} fill={Colors.bg} />
        ) : (
          <Search size={20} color={Colors.bg} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.demoRow}
        onPress={onDemoPress}
        accessibilityRole="button"
        accessibilityLabel="Demo simulation"
      >
        <Play size={16} color={Colors.textDim} />
        <Text style={styles.demoLabel}>Demo — simulation</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingBottom: Spacing.sm,
  },
  scanBar: {
    height: ACCENT_BAR_HEIGHT,
    backgroundColor: Colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
  },
  scanBarDisabled: { opacity: 0.5 },
  scanBarLabel: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.md,
    color: Colors.bg,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  demoRow: {
    height: SECONDARY_ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  demoLabel: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: Typography.sm,
    color: Colors.textDim,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
