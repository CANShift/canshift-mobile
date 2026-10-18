import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack";
import DeviceScreen from "../screens/DeviceScreen";
import ConsoleScreen from "../screens/ConsoleScreen";
import { UiColors } from "../theme/ui-tokens";

type DeviceStackParamList = Record<"DeviceHome" | "Console", undefined>;

const Stack = createNativeStackNavigator<DeviceStackParamList>();

const DeviceHome = ({
  navigation,
}: NativeStackScreenProps<DeviceStackParamList, "DeviceHome">) => (
  <DeviceScreen
    onOpenConsole={() => {
      navigation.navigate("Console");
    }}
  />
);

const DeviceConsole = ({
  navigation,
}: NativeStackScreenProps<DeviceStackParamList, "Console">) => (
  <ConsoleScreen onBack={navigation.goBack} />
);

const DeviceStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: UiColors.bg },
    }}
  >
    <Stack.Screen name="DeviceHome" component={DeviceHome} />
    <Stack.Screen name="Console" component={DeviceConsole} />
  </Stack.Navigator>
);

export default DeviceStack;
