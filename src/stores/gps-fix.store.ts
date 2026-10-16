import { create } from "zustand";

export type GpsPermission = "unknown" | "granted" | "denied";

interface GpsFixState {
  permission: GpsPermission;
  accuracyM: number | null;
}

export const useGpsFixStore = create<GpsFixState>()(() => ({
  permission: "unknown",
  accuracyM: null,
}));

export const setGpsAccuracy = (accuracyM: number | null): void => {
  useGpsFixStore.setState({ accuracyM });
};

export const setGpsPermission = (permission: GpsPermission): void => {
  useGpsFixStore.setState({ permission });
};
