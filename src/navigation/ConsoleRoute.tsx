import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import ConsoleScreen from "../screens/ConsoleScreen";
import type { RootStackParamList } from "./index";

type ConsoleRouteProps = NativeStackScreenProps<RootStackParamList, "Console">;

export const ConsoleRoute = ({ navigation }: ConsoleRouteProps) => (
  <ConsoleScreen onBack={navigation.goBack} />
);
