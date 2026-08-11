const EM_DASH = "—";
const NOT_CONNECTED = "Not connected";

export const firmwareLabel = (
  isSim: boolean,
  connected: boolean,
  firmwareVersion: string | null,
): string => {
  if (isSim) return "Simulator";
  if (!connected) return NOT_CONNECTED;
  if (firmwareVersion === null) return EM_DASH;
  return `v${firmwareVersion}`;
};
