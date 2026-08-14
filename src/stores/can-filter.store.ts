import { create } from "zustand";
import type { CanIdRange } from "../lib/can-filter";

export const DEFAULT_CAN_ID_RANGE: CanIdRange = { from: 0x2c0, to: 0x2cf };

interface CanFilterState {
  range: CanIdRange | null;
  clear: () => void;
}

export const useCanFilterStore = create<CanFilterState>()((set) => ({
  range: DEFAULT_CAN_ID_RANGE,

  clear: () => {
    set({ range: null });
  },
}));
