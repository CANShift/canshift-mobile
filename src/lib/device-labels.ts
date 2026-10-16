import { STRINGS } from "../strings";
import { NO_VALUE } from "./tile-state";

export const firmwareLabel = (
  isSim: boolean,
  connected: boolean,
  firmwareVersion: string | null,
): string => {
  if (isSim) return STRINGS.device.simulator;
  if (!connected) return STRINGS.link.offline;
  if (firmwareVersion === null) return NO_VALUE;
  return `v${firmwareVersion}`;
};
