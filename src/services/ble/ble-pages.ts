import type { Device } from "react-native-ble-plx";
import { parseBlePages } from "@canshift/core/wire";
import { BLE_CHAR_PAGES, BLE_SERVICE_UUID } from "../../constants/ble";
import { log } from "../../stores/log.store";
import {
  useDashPagesStore,
  type PageListState,
} from "../../stores/dash-pages.store";
import { mapBleError, describeBleError } from "../ble.errors";
import { decodeBase64 } from "../base64";
import type { MonitorHost } from "./ble-monitors";

type PagesRead =
  { kind: "ok"; raw: string | null } | { kind: "error"; error: unknown };

const readRaw = async (
  host: MonitorHost,
  device: Device,
): Promise<PagesRead> => {
  try {
    const char = await host.runGatt(() =>
      device.readCharacteristicForService(BLE_SERVICE_UUID, BLE_CHAR_PAGES),
    );
    return { kind: "ok", raw: char.value };
  } catch (error) {
    return { kind: "error", error };
  }
};

const failureState = (error: unknown): PageListState => {
  const mapped = mapBleError(error);
  log("warn", `BLE: dash pages unreadable — ${describeBleError(mapped)}`);
  return mapped.kind === "characteristic-missing" ? "unsupported" : "failed";
};

const applyRaw = (raw: string | null): void => {
  const store = useDashPagesStore.getState();
  const result = parseBlePages(raw === null ? "" : decodeBase64(raw));
  if (result.kind !== "ok") {
    log("warn", `BLE: rejected malformed pages payload (${result.kind})`);
    store.setListState("failed");
    return;
  }
  store.setPages(result.pages);
};

export const readDashPages = async (
  host: MonitorHost,
  device: Device,
): Promise<void> => {
  const read = await readRaw(host, device);
  if (read.kind === "error") {
    useDashPagesStore.getState().setListState(failureState(read.error));
    return;
  }
  applyRaw(read.raw);
};
