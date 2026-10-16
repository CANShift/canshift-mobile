import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "./index";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const resetToScan = (): void => {
  if (!navigationRef.isReady()) return;
  navigationRef.reset({ index: 0, routes: [{ name: "Scan" }] });
};
