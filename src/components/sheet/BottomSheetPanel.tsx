import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UiColors, UiRadius } from "../../theme/ui-tokens";

const SHEET_PADDING = 20;

interface BottomSheetPanelProps {
  children: ReactNode;
}

export const BottomSheetPanel = ({ children }: BottomSheetPanelProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.sheet, { paddingBottom: SHEET_PADDING + insets.bottom }]}
      accessibilityViewIsModal
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    padding: SHEET_PADDING,
    gap: 16,
    backgroundColor: UiColors.surface,
    borderTopLeftRadius: UiRadius.sheet,
    borderTopRightRadius: UiRadius.sheet,
    borderWidth: 1,
    borderColor: UiColors.border,
  },
});
