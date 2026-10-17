import { createFirmwareReleaseStore } from "./firmware-release.store";
import { createFirmwareFlowStore } from "./firmware-flow.store";
import { DashSocket } from "../services/workshop/dash-socket";
import { connectWebSocket } from "../services/workshop/socket-transport";
import { DASH_SOCKET_URL } from "../services/workshop/workshop-wire";
import { dashWifi } from "../services/workshop/dash-wifi";
import { bleHandoff } from "../services/workshop/ble-handoff";
import {
  loadWorkshopNetwork,
  saveWorkshopNetwork,
} from "../services/workshop/workshop-network";
import {
  discardFirmwareFiles,
  fetchFirmwareFile,
  fetchGithubJson,
  sha256Hex,
} from "../services/workshop/firmware-net";

export const useFirmwareReleaseStore = createFirmwareReleaseStore({
  fetchJson: fetchGithubJson,
  fetchFile: fetchFirmwareFile,
  sha256Hex,
  discardCache: discardFirmwareFiles,
});

export const useFirmwareFlowStore = createFirmwareFlowStore({
  openSocket: () =>
    DashSocket.open({ url: DASH_SOCKET_URL, connect: connectWebSocket }),
  wifi: dashWifi,
  ble: bleHandoff,
  network: { load: loadWorkshopNetwork, save: saveWorkshopNetwork },
  sleep: (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    }),
  now: Date.now,
});
