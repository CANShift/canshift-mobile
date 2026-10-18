import React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScanScreen from "../screens/ScanScreen";
import ConnectedNavigator from "./ConnectedNavigator";
import { navigationRef } from "./navigation-ref";
import { DeviceRoute } from "./DeviceRoute";
import { ConsoleRoute } from "./ConsoleRoute";
import { OverlayHost } from "../components/shell/OverlayHost";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RootStackParamList = {
  Scan: undefined;
  Connected: undefined;
  Device: undefined;
  Console: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <View style={styles.root}>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Scan"
        >
          <Stack.Screen name="Scan" component={ScanScreen} />
          <Stack.Screen name="Connected" component={ConnectedNavigator} />
          <Stack.Screen name="Device" component={DeviceRoute} />
          <Stack.Screen name="Console" component={ConsoleRoute} />
        </Stack.Navigator>
        <OverlayHost />
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default Navigation;
