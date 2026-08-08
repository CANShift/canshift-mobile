import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScanScreen from "../screens/ScanScreen";
import DeviceScreen from "../screens/DeviceScreen";
import ConnectedNavigator from "./ConnectedNavigator";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RootStackParamList = {
  Scan: undefined;
  Connected: undefined;
  Device: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Scan"
      >
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="Connected" component={ConnectedNavigator} />
        <Stack.Screen name="Device" component={DeviceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
