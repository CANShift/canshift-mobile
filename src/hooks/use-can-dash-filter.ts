import { useEffect, useMemo, useRef } from "react";
import { bleService } from "../services/ble.service";
import { useCanMonitorStore } from "../stores/can-monitor.store";
import { log } from "../stores/log.store";
import { errText } from "../lib/error-text";
import { dashFilterFor, filterKey } from "../lib/can-id-filter";
import type { CanSource } from "./use-can-feed";

export const DASH_FILTER_DEBOUNCE_MS = 300;

const pushFilter = async (
  filters: ReturnType<typeof dashFilterFor>,
): Promise<void> => {
  const { setDashFilterFailed } = useCanMonitorStore.getState();
  try {
    await bleService.canMonitor.setFilter(filters);
    setDashFilterFailed(false);
  } catch (err) {
    log("warn", `BLE: the dash CAN filter was not set — ${errText(err)}`);
    setDashFilterFailed(true);
  }
};

export const useCanDashFilter = (source: CanSource, text: string): void => {
  const filters = useMemo(() => dashFilterFor(text), [text]);
  const key = filterKey(filters);
  const sent = useRef("");
  useEffect(() => {
    if (source !== "ble") {
      sent.current = "";
      return;
    }
    if (key === sent.current) return;
    const timer = setTimeout(() => {
      sent.current = key;
      void pushFilter(filters);
    }, DASH_FILTER_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [source, key, filters]);
};
