import * as Battery from "expo-battery";

export interface PhoneBatteryWatcher {
  read: () => Promise<number>;
  subscribe: (onLevel: (fraction: number) => void) => () => void;
}

export const expoBatteryWatcher: PhoneBatteryWatcher = {
  read: () => Battery.getBatteryLevelAsync(),
  subscribe: (onLevel) => {
    const subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      onLevel(batteryLevel);
    });
    return () => {
      subscription.remove();
    };
  },
};
