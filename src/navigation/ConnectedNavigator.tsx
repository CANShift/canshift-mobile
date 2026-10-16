import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LiveScreen from "../screens/LiveScreen";
import GraphScreen from "../screens/GraphScreen";
import LapsScreen from "../screens/LapsScreen";
import DeviceScreen from "../screens/DeviceScreen";
import { ShellTabBar } from "../components/shell/ShellTabBar";
import { ShellHeader } from "../components/shell/ShellHeader";
import { UiColors } from "../theme/ui-tokens";
import type { ShellTab } from "../lib/shell-tabs";
import { useIsLandscape } from "../hooks/use-is-landscape";
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
  const isLandscape = useIsLandscape();
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        header: renderHeader,
        tabBarPosition: isLandscape ? "left" : "bottom",
        sceneStyle: { backgroundColor: UiColors.bg },
      }}
    >
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Graph" component={GraphScreen} />
      <Tab.Screen name="Laps" component={LapsScreen} />
      <Tab.Screen name="Device">
        {() => <DeviceScreen navigation={navigation} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default ConnectedNavigator;
