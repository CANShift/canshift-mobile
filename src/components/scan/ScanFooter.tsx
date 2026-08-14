import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Fonts, SCREEN_PADDING } from "../../theme";

const ACTION_BORDER = 2;
const ACTION_PADDING_VERTICAL = 18;
const ACTION_PADDING_HORIZONTAL = 21;
const ACTION_LABEL_SIZE = 16;
const ACTION_LABEL_TRACKING = ACTION_LABEL_SIZE * 0.09;
const LINK_SIZE = 15;
const NOTE_SIZE = 16;
const NOTE_LINE_HEIGHT = 26;
const NOTE_MARGIN_TOP = 26;
const LINK_GAP = 26;
const LINK_MARGIN_TOP = 18;

const PAIRING_NOTE = "The dash shows a four-digit code. Confirm it there.";

type ScanAction = "stop" | "rescan" | "scan";

const SCAN_ACTION_LABELS: Record<ScanAction, string> = {
  stop: "Stop scanning",
  rescan: "Scan again",
  scan: "Scan for devices",
};

const scanAction = (scanning: boolean, hasScanned: boolean): ScanAction => {
  if (scanning) return "stop";
  return hasScanned ? "rescan" : "scan";
};

export interface ScanFooterProps {
  scanning: boolean;
  hasScanned: boolean;
  disabled: boolean;
  onScanPress: () => void;
  onDemoPress: () => void;
  onInfoPress: () => void;
}

export const ScanFooter = ({
  scanning,
  hasScanned,
  disabled,
  onScanPress,
  onDemoPress,
  onInfoPress,
}: ScanFooterProps) => {
  const label = SCAN_ACTION_LABELS[scanAction(scanning, hasScanned)];
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.action, disabled && styles.actionDisabled]}
        onPress={onScanPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        <Text style={styles.actionLabel}>{label}</Text>
      </TouchableOpacity>

      <View style={styles.links}>
        <TouchableOpacity
          onPress={onDemoPress}
          accessibilityRole="button"
          accessibilityLabel="Demo simulation"
        >
          <Text style={styles.link}>Demo — simulation</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onInfoPress}
          accessibilityRole="button"
          accessibilityLabel="Device and app info"
        >
          <Text style={styles.link}>Device info</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>{PAIRING_NOTE}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: SCREEN_PADDING,
  },
  action: {
    borderWidth: ACTION_BORDER,
    borderColor: Colors.text,
    paddingVertical: ACTION_PADDING_VERTICAL,
    paddingHorizontal: ACTION_PADDING_HORIZONTAL,
  },
  actionDisabled: { opacity: 0.5 },
  actionLabel: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: ACTION_LABEL_SIZE,
    letterSpacing: ACTION_LABEL_TRACKING,
    textTransform: "uppercase",
    color: Colors.text,
  },
  links: {
    flexDirection: "row",
    gap: LINK_GAP,
    marginTop: LINK_MARGIN_TOP,
  },
  link: {
    fontFamily: Fonts.mono,
    fontSize: LINK_SIZE,
    color: Colors.textMuted,
  },
  note: {
    fontFamily: Fonts.mono,
    fontSize: NOTE_SIZE,
    lineHeight: NOTE_LINE_HEIGHT,
    color: Colors.textMuted,
    marginTop: NOTE_MARGIN_TOP,
  },
});
