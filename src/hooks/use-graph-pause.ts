import { useState } from "react";
import { useSignalsStore } from "../stores/signals.store";
import { useLink } from "./use-link";

export interface GraphPause {
  paused: boolean;
  pausedAt: number;
  userPaused: boolean;
  togglePause: () => void;
}

export const useGraphPause = (): GraphPause => {
  const [userPausedAt, setUserPausedAt] = useState<number | null>(null);
  const autoPaused = useLink() === "reconnecting";
  const lastUpdateMs = useSignalsStore((s) => s.lastUpdateMs);
  const pausedAt = userPausedAt ?? (autoPaused ? lastUpdateMs : 0);
  return {
    paused: userPausedAt !== null || autoPaused,
    pausedAt,
    userPaused: userPausedAt !== null,
    togglePause: () => {
      setUserPausedAt((current) => (current === null ? Date.now() : null));
    },
  };
};
