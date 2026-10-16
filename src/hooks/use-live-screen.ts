import { useState } from "react";
import { useSignalsStore } from "../stores/signals.store";
import { isSignalFresh } from "../lib/signal-staleness";
import { useLink } from "./use-link";
import { useNowMs } from "./use-now-ms";
import { useLiveLayout, type LiveLayout } from "./use-live-layout";

export interface LiveScreenModel {
  layout: LiveLayout;
  paused: boolean;
  nowMs: number;
  rpm: number | null;
  dashConnected: boolean;
  displayOpen: boolean;
  openDisplay: () => void;
  closeDisplay: () => void;
}

const useShownRpm = (paused: boolean, nowMs: number): number | null => {
  const rpm = useSignalsStore((s) => s.values.r);
  const lastAt = useSignalsStore((s) => s.lastAt.r);
  const fresh = !paused && isSignalFresh(lastAt, nowMs);
  return fresh && rpm !== undefined ? rpm : null;
};

export const useLiveScreen = (): LiveScreenModel => {
  const link = useLink();
  const paused = link === "reconnecting";
  const nowMs = useNowMs(true);
  const rpm = useShownRpm(paused, nowMs);
  const [displayOpen, setDisplayOpen] = useState(false);
  return {
    layout: useLiveLayout(),
    paused,
    nowMs,
    rpm,
    dashConnected: link === "connected",
    displayOpen,
    openDisplay: () => {
      setDisplayOpen(true);
    },
    closeDisplay: () => {
      setDisplayOpen(false);
    },
  };
};
