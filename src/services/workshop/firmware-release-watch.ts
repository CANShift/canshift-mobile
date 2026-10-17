import { useDeviceStore } from "../../stores/device.store";
import { useFirmwareReleaseStore } from "../../stores/firmware-stores";

interface DashIdentity {
  boardId: string;
  version: string;
}

const connectedDash = (): DashIdentity | null => {
  const { connectionState, mode, boardId, firmwareVersion } =
    useDeviceStore.getState();
  if (connectionState !== "connected" || mode !== "ble") return null;
  if (boardId === null || firmwareVersion === null) return null;
  return { boardId, version: firmwareVersion };
};

export const startFirmwareReleaseWatch = (): (() => void) => {
  let checkedFor = "";
  const checkIfNew = (): void => {
    const dash = connectedDash();
    const key = dash === null ? "" : `${dash.boardId}@${dash.version}`;
    if (dash === null || key === checkedFor) return;
    checkedFor = key;
    void useFirmwareReleaseStore.getState().check(dash.boardId, dash.version);
  };
  checkIfNew();
  return useDeviceStore.subscribe(checkIfNew);
};
