import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { BottomSheetHead } from "./BottomSheetHead";
import { BottomSheetPanel } from "./BottomSheetPanel";

export interface BottomSheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  accessory?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

export const BottomSheet = ({
  visible,
  onClose,
  children,
  ...head
}: BottomSheetProps) => (
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
      <BottomSheetPanel>
        <BottomSheetHead {...head} />
        {children}
      </BottomSheetPanel>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "#000000AA" },
});
