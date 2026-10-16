import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Navigation from "./navigation";
import { Toaster } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { KeepAwakeWhileLinked } from "@/components/shell/KeepAwakeWhileLinked";
import { useBleForegroundReconnect } from "@/hooks/use-ble-foreground-reconnect";
import { usePhoneBatteryGuard } from "@/hooks/use-phone-battery-guard";
import { useAppSettingsStore } from "@/stores/app-settings.store";
import { hydrateTimerSessions } from "@/stores/timer-sessions.store";
import { startAlertServices } from "@/services/alert-services";
import { markFirstScreenReady } from "./diag/cold-start";

const App = () => {
  useBleForegroundReconnect();
  usePhoneBatteryGuard();
  useEffect(() => startAlertServices(), []);
  useEffect(() => {
    void useAppSettingsStore.getState().hydrate();
    void hydrateTimerSessions();
    markFirstScreenReady();
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <KeepAwakeWhileLinked />
      <ErrorBoundary>
        <Navigation />
      </ErrorBoundary>
      <Toaster />
    </SafeAreaProvider>
  );
};

export default App;
