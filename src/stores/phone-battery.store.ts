import { create } from "zustand";

interface PhoneBatteryState {
  levelPercent: number | null;
}

export const usePhoneBatteryStore = create<PhoneBatteryState>()(() => ({
  levelPercent: null,
}));

export const setPhoneBatteryPercent = (levelPercent: number | null): void => {
  usePhoneBatteryStore.setState({ levelPercent });
};
