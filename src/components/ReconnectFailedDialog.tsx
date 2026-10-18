import { Modal, StyleSheet, View } from "react-native";
import { useDeviceStore } from "../stores/device.store";
import { backToScan } from "../services/session-exit";
import { STRINGS } from "../strings";
import { ReconnectFailedCard } from "./ReconnectFailedCard";

const ReconnectFailedDialog = () => {
  const dashName =
    useDeviceStore((s) => s.lastDashName) ?? STRINGS.connect.theDash;
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={backToScan}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={styles.scrim}>
        <ReconnectFailedCard dashName={dashName} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#000000B8",
  },
});

export default ReconnectFailedDialog;
