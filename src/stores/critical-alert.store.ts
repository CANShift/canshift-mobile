import { create } from "zustand";
import { type SignalKey } from "../constants/ble";

interface CriticalAlertState {
  mutedKeys: SignalKey[];
  acknowledgedKey: SignalKey | null;
  mute: (key: SignalKey) => void;
  acknowledge: (key: SignalKey) => void;
  clearAcknowledged: () => void;
  reset: () => void;
}

export const useCriticalAlertStore = create<CriticalAlertState>()((set) => ({
  mutedKeys: [],
  acknowledgedKey: null,
  mute: (key) => {
    set((s) => ({
      mutedKeys: s.mutedKeys.includes(key)
        ? s.mutedKeys
        : [...s.mutedKeys, key],
      acknowledgedKey: null,
    }));
  },
  acknowledge: (key) => {
    set({ acknowledgedKey: key });
  },
  clearAcknowledged: () => {
    set({ acknowledgedKey: null });
  },
  reset: () => {
    set({ mutedKeys: [], acknowledgedKey: null });
  },
}));
