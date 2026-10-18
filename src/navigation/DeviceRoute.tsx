import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import DeviceScreen from "../screens/DeviceScreen";
import type { RootStackParamList } from "./index";

type DeviceRouteProps = NativeStackScreenProps<RootStackParamList, "Device">;

export const DeviceRoute = ({ navigation }: DeviceRouteProps) => (
  <DeviceScreen
    onBack={navigation.goBack}
    onOpenConsole={() => {
      navigation.navigate("Console");
    }}
  />
);
