import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DashScreen from "../screens/DashScreen";
import GraphScreen from "../screens/GraphScreen";
import TrackScreen from "../screens/TrackScreen";
import DeviceScreen from "../screens/DeviceScreen";
import ReconnectBanner from "../components/ReconnectBanner";
import ReconnectFailedDialog from "../components/ReconnectFailedDialog";
import { CriticalAlertOverlay } from "../components/CriticalAlertOverlay";
import { useCriticalAlertHolds } from "../hooks/use-critical-alert";
import { Colors, Fonts } from "../theme";
import type { RootStackParamList } from "./index";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Connected">;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ConnectedTabParamList = {
  Dash: undefined;
  Graph: undefined;
  Track: undefined;
  Device: undefined;
};

const Tab = createBottomTabNavigator<ConnectedTabParamList>();

const TAB_BAR_HEIGHT = 84;
const TAB_BAR_HEIGHT_LANDSCAPE = 48;
const TAB_BAR_RULE = 2;
const TAB_LABEL_SIZE = 11;
const TAB_LABEL_SIZE_LANDSCAPE = 9;
const TAB_LABEL_TRACKING = TAB_LABEL_SIZE * 0.1;

const ConnectedNavigator = ({ navigation }: Props) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const alertHolds = useCriticalAlertHolds();

  const tabBarStyle = {
    backgroundColor: Colors.bg,
    borderTopWidth: TAB_BAR_RULE,
    borderTopColor: Colors.border,
    height:
      (isLandscape ? TAB_BAR_HEIGHT_LANDSCAPE : TAB_BAR_HEIGHT) + insets.bottom,
    paddingBottom: insets.bottom,
  };

  return (
    <View style={styles.container}>
      <ReconnectBanner navigation={navigation} />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: alertHolds ? styles.tabBarHidden : tabBarStyle,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelPosition: "beside-icon",
          tabBarIconStyle: styles.tabIconHidden,
          tabBarItemStyle: styles.tabItem,
          tabBarLabelStyle: {
            fontFamily: Fonts.uiExtraBold,
            fontSize: isLandscape ? TAB_LABEL_SIZE_LANDSCAPE : TAB_LABEL_SIZE,
            letterSpacing: TAB_LABEL_TRACKING,
            textTransform: "uppercase",
          },
        }}
      >
        <Tab.Screen name="Dash" options={{ tabBarLabel: "Dash" }}>
          {() => <DashScreen navigation={navigation} />}
        </Tab.Screen>
        <Tab.Screen
          name="Graph"
          component={GraphScreen}
          options={{ tabBarLabel: "Graph" }}
        />
        <Tab.Screen
          name="Track"
          component={TrackScreen}
          options={{ tabBarLabel: "Track" }}
        />
        <Tab.Screen name="Device" options={{ tabBarLabel: "Device" }}>
          {() => <DeviceScreen navigation={navigation} />}
        </Tab.Screen>
      </Tab.Navigator>
      <ReconnectFailedDialog navigation={navigation} />
      <CriticalAlertOverlay />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  tabIconHidden: { display: "none" },
  tabBarHidden: { display: "none" },
  tabItem: { justifyContent: "center", alignItems: "center" },
});

export default ConnectedNavigator;
