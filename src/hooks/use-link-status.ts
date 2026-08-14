import { useEffect, useState } from "react";
import { useDeviceStore } from "../stores/device.store";
import { useSignalsStore, useSignalsIsLive } from "../stores/signals.store";
import {
  isHoldExpired,
  linkLostSeconds,
  linkState,
  type LinkState,
} from "../lib/link-hold";

const TICK_MS = 1000;

export interface LinkStatus {
  state: LinkState;
  secondsAgo: number;
}

interface LinkSource {
  state: LinkState;
  staleSinceMs: number;
}

const useLinkSource = (): LinkSource => {
  const isSim = useDeviceStore((s) => s.mode === "sim");
  const isLive = useSignalsIsLive();
  const staleSinceMs = useSignalsStore((s) => s.staleSinceMs);
  if (isSim) return { state: "live", staleSinceMs: 0 };
  return { state: linkState(isLive, staleSinceMs), staleSinceMs };
};

const clearExpiredHold = (staleSinceMs: number, nowMs: number): void => {
  if (!isHoldExpired(staleSinceMs, nowMs)) return;
  const { values, clearHeld } = useSignalsStore.getState();
  if (Object.keys(values).length === 0) return;
  clearHeld();
};

export const useIsLinkLost = (): boolean => useLinkSource().state === "lost";

export const useLinkStatus = (): LinkStatus => {
  const { state, staleSinceMs } = useLinkSource();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (staleSinceMs === 0) return;
    setNowMs(Date.now());
    const id = setInterval(() => {
      setNowMs(Date.now());
    }, TICK_MS);
    return () => {
      clearInterval(id);
    };
  }, [staleSinceMs]);

  useEffect(() => {
    clearExpiredHold(staleSinceMs, nowMs);
  }, [staleSinceMs, nowMs]);

  return { state, secondsAgo: linkLostSeconds(staleSinceMs, nowMs) };
};
