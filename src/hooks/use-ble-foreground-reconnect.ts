import { useEffect, useMemo, useRef } from "react";
import {
  AppState,
  type AppStateStatus,
  type EventSubscription,
} from "react-native";
import { useDeviceStore, type ConnectionState } from "../stores/device.store";
import { useReconnectStore } from "../stores/reconnect.store";
import { tryReconnectLastDevice } from "../services/ble.service";
import { Toast, type ToastShowParams } from "../components/ui/toast";
import { log } from "../stores/log.store";
import { errText } from "../lib/error-text";
import { STRINGS } from "../strings";

const isReconnectable = (state: ConnectionState): boolean => {
  return state === "idle" || state === "error";
};

type ObservedAppState = (typeof AppState)["currentState"];

const isBackgrounded = (state: ObservedAppState): boolean => {
  return state === "background" || state === "inactive";
};

export interface BleForegroundReconnectDeps {
  appState?: Pick<typeof AppState, "addEventListener" | "currentState">;
  tryReconnect?: () => Promise<boolean>;
  showToast?: (params: ToastShowParams) => void;
  getConnectionState?: () => ConnectionState;
  getIsReconnecting?: () => boolean;
}

interface ResolvedDeps {
  appState: Pick<typeof AppState, "addEventListener" | "currentState">;
  tryReconnect: () => Promise<boolean>;
  showToast: (params: ToastShowParams) => void;
  getConnectionState: () => ConnectionState;
  getIsReconnecting: () => boolean;
}

const resolveDeps = (deps: BleForegroundReconnectDeps): ResolvedDeps => {
  return {
    appState: deps.appState ?? AppState,
    tryReconnect: deps.tryReconnect ?? tryReconnectLastDevice,
    showToast:
      deps.showToast ??
      ((params) => {
        Toast.show(params);
      }),
    getConnectionState:
      deps.getConnectionState ??
      (() => useDeviceStore.getState().connectionState),
    getIsReconnecting:
      deps.getIsReconnecting ??
      (() => useReconnectStore.getState().isReconnecting),
  };
};

const DEFAULT_DEPS: BleForegroundReconnectDeps = Object.freeze({});

export const handleAppStateTransition = async (
  prev: ObservedAppState,
  next: AppStateStatus,
  deps: ResolvedDeps,
): Promise<void> => {
  if (next !== "active" || !isBackgrounded(prev)) return;

  if (deps.getIsReconnecting()) return;
  if (!isReconnectable(deps.getConnectionState())) return;

  let started: boolean;
  try {
    started = await deps.tryReconnect();
  } catch (err) {
    log("warn", `Foreground reconnect attempt failed: ${errText(err)}`);
    deps.showToast({
      type: "error",
      text1: STRINGS.device.foregroundReconnectFailed,
    });
    return;
  }

  if (started) {
    deps.showToast({
      type: "info",
      text1: STRINGS.device.foregroundReconnectTitle,
      text2: STRINGS.device.foregroundReconnectBody,
    });
  }
};

export const useBleForegroundReconnect = (
  deps: BleForegroundReconnectDeps = DEFAULT_DEPS,
): void => {
  const resolved = useMemo(() => resolveDeps(deps), [deps]);
  const lastStateRef = useRef<ObservedAppState>(resolved.appState.currentState);

  useEffect(() => {
    const subscription: EventSubscription = resolved.appState.addEventListener(
      "change",
      (next) => {
        const prev = lastStateRef.current;
        lastStateRef.current = next;
        void handleAppStateTransition(prev, next, resolved);
      },
    );

    return () => {
      subscription.remove();
    };
  }, [resolved]);
};
