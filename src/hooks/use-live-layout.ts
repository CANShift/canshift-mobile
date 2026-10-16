import { useIsLandscape } from "./use-is-landscape";

export interface LiveLayout {
  columns: number;
  valueSize: number;
  shiftLightHeight: number;
}

const PORTRAIT: LiveLayout = {
  columns: 2,
  valueSize: 48,
  shiftLightHeight: 22,
};
const LANDSCAPE: LiveLayout = {
  columns: 4,
  valueSize: 50,
  shiftLightHeight: 24,
};

export const useLiveLayout = (): LiveLayout =>
  useIsLandscape() ? LANDSCAPE : PORTRAIT;
