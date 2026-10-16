import { create } from "zustand";
import {
  phoneBatteryStatus,
  type PhoneBatteryStatus,
} from "../lib/phone-battery";

interface PhoneBatteryState {
  levelPercent: number | null;
  dismissedStatus: PhoneBatteryStatus | null;
}

export const usePhoneBatteryStore = create<PhoneBatteryState>()(() => ({
  levelPercent: null,
  dismissedStatus: null,
}));

export const setPhoneBatteryPercent = (levelPercent: number | null): void => {
  const recovered = phoneBatteryStatus(levelPercent) === "ok";
  usePhoneBatteryStore.setState((s) => ({
    levelPercent,
    dismissedStatus: recovered ? null : s.dismissedStatus,
  }));
};

export const dismissBatteryBanner = (): void => {
  usePhoneBatteryStore.setState((s) => ({
    dismissedStatus: phoneBatteryStatus(s.levelPercent),
  }));
};
