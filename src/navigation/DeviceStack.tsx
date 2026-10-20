import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack";
import DeviceScreen from "../screens/DeviceScreen";
import ConsoleScreen from "../screens/ConsoleScreen";
import PagesScreen from "../screens/PagesScreen";
import { PAGES_STRINGS } from "../pages-strings";
import { UiColors } from "../theme/ui-tokens";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type DeviceStackParamList = {
  DeviceHome: undefined;
  Console: undefined;
  Pages: { returnTo?: "Live" } | undefined;
};

const Stack = createNativeStackNavigator<DeviceStackParamList>();

const DeviceHome = ({
  navigation,
}: NativeStackScreenProps<DeviceStackParamList, "DeviceHome">) => (
  <DeviceScreen
    onOpenConsole={() => {
      navigation.navigate("Console");
    }}
    onOpenPages={() => {
      navigation.navigate("Pages");
    }}
  />
);

const DeviceConsole = ({
  navigation,
}: NativeStackScreenProps<DeviceStackParamList, "Console">) => (
  <ConsoleScreen onBack={navigation.goBack} />
);

const DevicePages = ({
  navigation,
  route,
}: NativeStackScreenProps<DeviceStackParamList, "Pages">) => {
  const returnTo = route.params?.returnTo;
  if (returnTo === undefined)
    return (
      <PagesScreen backLabel={PAGES_STRINGS.back} onBack={navigation.goBack} />
    );
  return (
    <PagesScreen
      backLabel={PAGES_STRINGS.backToLive}
      onBack={() => {
        navigation.popToTop();
        navigation.getParent()?.navigate(returnTo);
      }}
    />
  );
};

const DeviceStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: UiColors.bg },
    }}
  >
    <Stack.Screen name="DeviceHome" component={DeviceHome} />
    <Stack.Screen name="Console" component={DeviceConsole} />
    <Stack.Screen name="Pages" component={DevicePages} />
  </Stack.Navigator>
);

export default DeviceStack;
