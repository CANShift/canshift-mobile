import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DashScreen from "../screens/DashScreen";
import GraphScreen from "../screens/GraphScreen";
import LogScreen from "../screens/LogScreen";
import TimerScreen from "../screens/TimerScreen";
import TrackScreen from "../screens/TrackScreen";
import ReconnectBanner from "../components/ReconnectBanner";
import ReconnectFailedDialog from "../components/ReconnectFailedDialog";
import { CriticalAlertOverlay } from "../components/CriticalAlertOverlay";
import { Colors, Typography, Fonts } from "../theme";
import type { RootStackParamList } from "./index";

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "Connected">;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ConnectedTabParamList = {
  Dash: undefined;
  Graph: undefined;
  Timer: undefined;
  Track: undefined;
  Console: undefined;
};

const Tab = createBottomTabNavigator<ConnectedTabParamList>();

const TAB_BAR_HEIGHT = 84;
const TAB_BAR_HEIGHT_LANDSCAPE = 48;
const TAB_BAR_RULE = 2;

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => {
  return (
    <Text
      style={[
        styles.tabIcon,
        { color: focused ? Colors.primary : Colors.textMuted },
      ]}
    >
      {icon}
    </Text>
  );
};

export default function ConnectedNavigator({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;

  return (
    <View style={styles.container}>
      <ReconnectBanner navigation={navigation} />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopWidth: TAB_BAR_RULE,
            borderTopColor: Colors.border,
            height:
              (isLandscape ? TAB_BAR_HEIGHT_LANDSCAPE : TAB_BAR_HEIGHT) +
              insets.bottom,
            paddingTop: isLandscape ? 4 : 12,
            paddingBottom: insets.bottom + (isLandscape ? 4 : 12),
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: {
            fontFamily: Fonts.ui,
            fontSize: isLandscape ? 9 : 10,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          },
          tabBarIconStyle: isLandscape ? { marginTop: 2 } : undefined,
        }}
      >
        <Tab.Screen
          name="Dash"
          options={{
            tabBarLabel: "Dash",
            tabBarIcon: ({ focused }) => <TabIcon icon="◉" focused={focused} />,
          }}
        >
          {() => <DashScreen navigation={navigation} />}
        </Tab.Screen>
        <Tab.Screen
          name="Graph"
          component={GraphScreen}
          options={{
            tabBarLabel: "Graph",
            tabBarIcon: ({ focused }) => <TabIcon icon="∿" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Timer"
          component={TimerScreen}
          options={{
            tabBarLabel: "Timer",
            tabBarIcon: ({ focused }) => <TabIcon icon="◷" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Track"
          component={TrackScreen}
          options={{
            tabBarLabel: "Track",
            tabBarIcon: ({ focused }) => <TabIcon icon="⚑" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Console"
          component={LogScreen}
          options={{
            tabBarLabel: "Console",
            tabBarIcon: ({ focused }) => <TabIcon icon="≡" focused={focused} />,
          }}
        />
      </Tab.Navigator>
      <ReconnectFailedDialog navigation={navigation} />
      <CriticalAlertOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  tabIcon: { fontSize: Typography.lg },
});
