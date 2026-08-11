import "../global.css";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Archivo_400Regular,
  Archivo_600SemiBold,
  Archivo_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/archivo";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
  JetBrainsMono_800ExtraBold,
} from "@expo-google-fonts/jetbrains-mono";
import Navigation from "./navigation";
import { Toaster } from "@/components/ui";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useBleForegroundReconnect } from "@/hooks/use-ble-foreground-reconnect";
import { useAppSettingsStore } from "@/stores/app-settings.store";
import { log } from "@/stores/log.store";
import { hydrateTimerSessions } from "@/stores/timer-sessions.store";
import { markFirstScreenReady } from "./diag/cold-start";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Archivo_400Regular,
    Archivo_600SemiBold,
    Archivo_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
    JetBrainsMono_800ExtraBold,
  });
  useBleForegroundReconnect();
  useEffect(() => {
    void useAppSettingsStore.getState().hydrate();
    void hydrateTimerSessions();
  }, []);
  useEffect(() => {
    if (fontsLoaded || fontError) markFirstScreenReady();
  }, [fontsLoaded, fontError]);
  useEffect(() => {
    if (fontError)
      log(
        "warn",
        `Font loading failed — falling back to system fonts: ${fontError.message}`,
      );
  }, [fontError]);
  if (!fontsLoaded && !fontError) return null;
  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <ErrorBoundary>
        <Navigation />
      </ErrorBoundary>
      <Toaster />
    </SafeAreaProvider>
  );
}
