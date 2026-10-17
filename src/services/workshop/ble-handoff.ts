import {
  holdReconnect,
  releaseReconnect,
  tryReconnectLastDevice,
} from "../ble.service";
import { useDeviceStore } from "../../stores/device.store";
import { log } from "../../stores/log.store";
import { errText } from "../../lib/error-text";
import type { BleHandoff } from "./firmware-flow-types";

const connectedVersion = (): string | null => {
  const { connectionState, mode, firmwareVersion } = useDeviceStore.getState();
  return connectionState === "connected" && mode === "ble"
    ? firmwareVersion
    : null;
};

const resume = async (): Promise<void> => {
  releaseReconnect();
  if (useDeviceStore.getState().connectionState === "connected") return;
  try {
    const started = await tryReconnectLastDevice();
    if (!started)
      log("warn", "No remembered dash to reconnect after the update");
  } catch (err) {
    log("warn", `Reconnecting after the update failed: ${errText(err)}`);
    useDeviceStore.getState().setError({ kind: "disconnected" });
  }
};

const waitForDash = (timeoutMs: number): Promise<string | null> =>
  new Promise((resolve) => {
    const unsubscribe = useDeviceStore.subscribe(() => {
      const version = connectedVersion();
      if (version === null) return;
      clearTimeout(timer);
      unsubscribe();
      resolve(version);
    });
    const timer = setTimeout(() => {
      unsubscribe();
      resolve(connectedVersion());
    }, timeoutMs);
  });

export const bleHandoff: BleHandoff = {
  hold: holdReconnect,
  resume,
  waitForDash,
};
