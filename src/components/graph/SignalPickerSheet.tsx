import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors, Fonts, Typography, SCREEN_PADDING } from "../../theme";
import { SIGNAL_META, type SignalKey } from "../../constants/ble";
import { Sheet, SheetContent } from "../ui/sheet";

const ALL_SIGNALS = Object.keys(SIGNAL_META) as SignalKey[];
const SELECTED_BAR = 3;

interface SignalPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibleSignals: SignalKey[];
  onToggleSignal: (key: SignalKey) => void;
}

export const SignalPickerSheet = ({
  open,
  onOpenChange,
  visibleSignals,
  onToggleSignal,
}: SignalPickerSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="bottom" className="p-0">
      <ScrollView style={styles.list}>
        {ALL_SIGNALS.map((key) => {
          const selected = visibleSignals.includes(key);
          return (
            <TouchableOpacity
              key={key}
              style={[styles.row, selected && styles.rowSelected]}
              onPress={() => {
                onToggleSignal(key);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${SIGNAL_META[key].label} signal`}
              accessibilityState={{ selected }}
            >
              <Text style={[styles.label, selected && styles.labelSelected]}>
                {SIGNAL_META[key].label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SheetContent>
  </Sheet>
);

const styles = StyleSheet.create({
  list: {
    maxHeight: 420,
    backgroundColor: Colors.bg,
  },
  row: {
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: SCREEN_PADDING,
    borderLeftWidth: SELECTED_BAR,
    borderLeftColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: Colors.ruleHair,
  },
  rowSelected: {
    backgroundColor: Colors.selectedBg,
    borderLeftColor: Colors.accent,
  },
  label: {
    fontFamily: Fonts.mono,
    fontSize: Typography.md,
    color: Colors.textDim,
  },
  labelSelected: { color: Colors.text },
});
