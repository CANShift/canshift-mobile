import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from "@react-navigation/native-stack";
import ScanScreen from "../screens/ScanScreen";
import DeviceScreen from "../screens/DeviceScreen";
import LogScreen from "../screens/LogScreen";
import ConnectedNavigator from "./ConnectedNavigator";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RootStackParamList = {
  Scan: undefined;
  Connected: undefined;
  Device: undefined;
  Console: undefined;
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
        <Stack.Screen name="Device">
          {({
            navigation,
          }: NativeStackScreenProps<RootStackParamList, "Device">) => (
            <DeviceScreen navigation={navigation} showBack />
          )}
        </Stack.Screen>
        <Stack.Screen name="Console">
          {({
            navigation,
          }: NativeStackScreenProps<RootStackParamList, "Console">) => (
            <LogScreen onBack={navigation.goBack} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
