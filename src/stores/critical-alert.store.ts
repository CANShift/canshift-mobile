import { create } from "zustand";
import { type SignalKey } from "../constants/ble";
import { retainAcknowledged } from "../lib/critical-alert";

interface CriticalAlertState {
  mutedKeys: SignalKey[];
  acknowledgedKeys: readonly SignalKey[];
  mute: (key: SignalKey) => void;
  acknowledge: (key: SignalKey) => void;
  retainTripped: (tripped: readonly SignalKey[]) => void;
  reset: () => void;
}

export const useCriticalAlertStore = create<CriticalAlertState>()((set) => ({
  mutedKeys: [],
  acknowledgedKeys: [],
  mute: (key) => {
    set((s) => ({
      mutedKeys: s.mutedKeys.includes(key)
        ? s.mutedKeys
        : [...s.mutedKeys, key],
      acknowledgedKeys: s.acknowledgedKeys.filter((k) => k !== key),
    }));
  },
  acknowledge: (key) => {
    set((s) => ({
      acknowledgedKeys: s.acknowledgedKeys.includes(key)
        ? s.acknowledgedKeys
        : [...s.acknowledgedKeys, key],
    }));
  },
  retainTripped: (tripped) => {
    set((s) => ({
      acknowledgedKeys: retainAcknowledged(s.acknowledgedKeys, tripped),
    }));
  },
  reset: () => {
    set({ mutedKeys: [], acknowledgedKeys: [] });
  },
}));
