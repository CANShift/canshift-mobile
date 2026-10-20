import { create } from "zustand";
import type { CanMonitorFrame } from "@canshift/core/wire";
import {
  EMPTY_CAN_SNAPSHOT,
  applyCanFrame,
  type CanMonitorSnapshot,
} from "../lib/can-monitor-model";

export type CanFeedState = "off" | "listening" | "unavailable";

interface CanMonitorState {
  snapshot: CanMonitorSnapshot;
  feed: CanFeedState;
  ingest: (frame: CanMonitorFrame) => void;
  setFeed: (feed: CanFeedState) => void;
  reset: () => void;
}

export const useCanMonitorStore = create<CanMonitorState>()((set) => ({
  snapshot: EMPTY_CAN_SNAPSHOT,
  feed: "off",
  ingest: (frame) => {
    set((state) => ({ snapshot: applyCanFrame(state.snapshot, frame) }));
  },
  setFeed: (feed) => {
    set({ feed });
  },
  reset: () => {
    set({ snapshot: EMPTY_CAN_SNAPSHOT, feed: "off" });
  },
}));
