import { useWindowDimensions } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DashScreen from "../screens/DashScreen";
import GraphScreen from "../screens/GraphScreen";
import TrackScreen from "../screens/TrackScreen";
import DeviceScreen from "../screens/DeviceScreen";
import { ShellTabBar } from "../components/shell/ShellTabBar";
import { ShellHeader } from "../components/shell/ShellHeader";
import { UiColors } from "../theme/ui-tokens";
import type { ShellTab } from "../lib/shell-tabs";
import type { RootStackParamList } from "./index";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Connected">;
}

export type ConnectedTabParamList = Record<ShellTab, undefined>;

const Tab = createBottomTabNavigator<ConnectedTabParamList>();

const renderTabBar = (props: Parameters<typeof ShellTabBar>[0]) => (
  <ShellTabBar {...props} />
);

const renderHeader = () => <ShellHeader />;

const ConnectedNavigator = ({ navigation }: Props) => {
  const { width, height } = useWindowDimensions();
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        header: renderHeader,
        tabBarPosition: width > height ? "left" : "bottom",
        sceneStyle: { backgroundColor: UiColors.bg },
      }}
    >
      <Tab.Screen name="Live">
        {() => <DashScreen navigation={navigation} />}
      </Tab.Screen>
      <Tab.Screen name="Graph" component={GraphScreen} />
      <Tab.Screen name="Laps" component={TrackScreen} />
      <Tab.Screen name="Device">
        {() => <DeviceScreen navigation={navigation} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default ConnectedNavigator;
