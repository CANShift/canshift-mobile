import { DEVICE_COMMANDS } from "@canshift/core/wire";
import { refreshDashPages, sendCmd } from "./ble.service";
import { useDeviceStore, type DeviceMode } from "../stores/device.store";
import { useDashPagesStore } from "../stores/dash-pages.store";
import { log } from "../stores/log.store";
import { errText } from "../lib/error-text";

const NOT_CONNECTED = new Error("Not connected");

const SHOW_BY_MODE: Record<DeviceMode, (pageId: string) => Promise<void>> = {
  idle: () => Promise.reject(NOT_CONNECTED),
  sim: (pageId) => {
    useDashPagesStore.getState().setOnScreen(pageId);
    return Promise.resolve();
  },
  ble: (pageId) => sendCmd(DEVICE_COMMANDS.showPage, { page: pageId }),
};

const refreshOverBle = async (): Promise<void> => {
  try {
    await refreshDashPages();
  } catch (err) {
    log("warn", `Dash pages refresh failed: ${errText(err)}`);
    useDashPagesStore.getState().setListState("failed");
  }
};

const REFRESH_BY_MODE: Record<DeviceMode, () => Promise<void>> = {
  idle: () => Promise.resolve(),
  sim: () => Promise.resolve(),
  ble: refreshOverBle,
};

export const showDashPage = (pageId: string): Promise<void> =>
  SHOW_BY_MODE[useDeviceStore.getState().mode](pageId);

export const refreshPages = (): Promise<void> => {
  const pages = useDashPagesStore.getState();
  if (pages.listState !== "ready") pages.setListState("loading");
  return REFRESH_BY_MODE[useDeviceStore.getState().mode]();
};
