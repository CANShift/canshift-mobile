import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { UiColors } from "../theme/ui-tokens";
import type { RootStackParamList } from "../navigation";
import { useScanScreen } from "../hooks/use-scan-screen";
import { ScanHeader } from "../components/scan/ScanHeader";
import { ScanBody } from "../components/scan/ScanViews";
import { ScanReconnectBanner } from "../components/scan/ScanReconnectBanner";
import { PairingSheet } from "../components/scan/PairingSheet";

const ScanScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Scan">) => {
  const insets = useSafeAreaInsets();
  const model = useScanScreen({
    toConnected: () => {
      navigation.replace("Connected");
    },
    toInfo: () => {
      navigation.navigate("Device");
    },
  });
  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <ScanHeader onInfo={model.openInfo} />
      {model.view === "reconnecting" ? (
        <ScanReconnectBanner
          dashName={model.lastDashName}
          onCancel={model.cancelReconnect}
        />
      ) : null}
      <ScanBody model={model} />
      <PairingSheet
        dashName={model.scan.connecting?.name ?? null}
        onCancel={() => void model.scan.cancelConnect()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: UiColors.bg },
});

export default ScanScreen;
