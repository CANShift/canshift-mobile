import { useTrackSessionStore } from "../stores/track-session.store";
import { startTrackMode, stopTrackMode } from "../lib/track-mode-actions";
import { useLoggingElapsedMs } from "./use-logging-elapsed-ms";

export interface LoggingCardModel {
  logging: boolean;
  elapsedMs: number;
  onStart: () => void;
  onStop: () => void;
}

export const useLoggingCard = (): LoggingCardModel => ({
  logging: useTrackSessionStore((s) => s.recording),
  elapsedMs: useLoggingElapsedMs(),
  onStart: () => void startTrackMode(),
  onStop: () => void stopTrackMode(),
});
