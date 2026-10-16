import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UiColors, UiRadius } from "../../theme/ui-tokens";

const TITLE_SIZE = 20;
const SHEET_PADDING = 20;

export interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export const BottomSheet = ({
  visible,
  title,
  onClose,
  children,
}: BottomSheetProps) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View
          style={[
            styles.sheet,
            { paddingBottom: SHEET_PADDING + insets.bottom },
          ]}
          accessibilityViewIsModal
        >
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000000AA" },
  sheet: {
    padding: SHEET_PADDING,
    gap: 16,
    backgroundColor: UiColors.surface,
    borderTopLeftRadius: UiRadius.sheet,
    borderTopRightRadius: UiRadius.sheet,
    borderWidth: 1,
    borderColor: UiColors.border,
  },
  title: { fontSize: TITLE_SIZE, fontWeight: "700", color: UiColors.text },
});
