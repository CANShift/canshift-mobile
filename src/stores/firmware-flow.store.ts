import { create, type StoreApi, type UseBoundStore } from "zustand";
import { log } from "./log.store";
import {
  installFirmware,
  type FirmwarePackage,
  type InstallResult,
} from "../services/workshop/ota-install";
import {
  BLE_RETURN_TIMEOUT_MS,
  CONNECT_ATTEMPTS,
  CONNECT_RETRY_MS,
  leaveWorkshop,
  reopenAfterRestart,
  viewAfterReturn,
} from "../services/workshop/firmware-flow-restart";
import {
  EMPTY_NETWORK,
  type WorkshopNetwork,
} from "../services/workshop/workshop-network";
import type { UsbStatus } from "@canshift/core/wire";
import type { DashSocket, OpenResult } from "../services/workshop/dash-socket";
import type {
  FirmwareFlowDeps,
  FirmwareStep,
  FlowView,
} from "../services/workshop/firmware-flow-types";

interface FirmwareFlowState {
  view: FlowView;
  pkg: FirmwarePackage | null;
  runningVersion: string;
  network: WorkshopNetwork;
  open: (
    pkg: FirmwarePackage,
    runningVersion: string,
    boardId: string | null,
  ) => Promise<void>;
  inWorkshop: () => void;
  setNetwork: (network: WorkshopNetwork) => void;
  join: () => Promise<void>;
  connect: () => Promise<void>;
  install: () => Promise<void>;
  cancelUpload: () => void;
  retry: () => Promise<void>;
  close: () => Promise<void>;
}

type Set = (patch: Partial<FirmwareFlowState>) => void;
type Get = () => FirmwareFlowState;

interface Session {
  socket: DashSocket | null;
  joinedSsid: string | null;
  boardId: string | null;
  inWorkshop: boolean;
  cancelRequested: boolean;
  generation: number;
}

interface Flow {
  deps: FirmwareFlowDeps;
  session: Session;
  set: Set;
  get: Get;
}

const running = (
  step: FirmwareStep,
  sent: number,
  total: number,
): FlowView => ({
  kind: "running",
  step,
  sent,
  total,
});

const VIEW_AFTER_OPEN: Record<OpenResult["kind"], FlowView> = {
  open: { kind: "ready" },
  busy: { kind: "busy" },
  unreachable: { kind: "unreachable" },
};

const openWithRetries = async (deps: FirmwareFlowDeps): Promise<OpenResult> => {
  let opened = await deps.openSocket();
  for (let attempt = 1; attempt < CONNECT_ATTEMPTS; attempt++) {
    if (opened.kind !== "unreachable") return opened;
    await deps.sleep(CONNECT_RETRY_MS);
    opened = await deps.openSocket();
  }
  return opened;
};

const settleStaleOpen = async (opened: OpenResult): Promise<void> => {
  if (opened.kind === "open") await leaveWorkshop(opened.socket);
};

const isLinkedDash = (
  dash: UsbStatus,
  runningVersion: string,
  boardId: string | null,
): boolean =>
  dash.firmwareVersion === runningVersion &&
  (boardId === null || dash.boardId === undefined || dash.boardId === boardId);

const refuseDifferentDash = ({ session, set }: Flow, socket: DashSocket) => {
  socket.close();
  session.socket = null;
  set({ view: { kind: "failed", failure: { kind: "differentDash" } } });
};

const connect = async (
  flow: Flow,
  generation = flow.session.generation,
): Promise<void> => {
  const { deps, session, set, get } = flow;
  if (session.generation !== generation) return;
  set({ view: { kind: "connecting" } });
  session.socket?.close();
  session.socket = null;
  const opened = await openWithRetries(deps);
  if (session.generation !== generation) return settleStaleOpen(opened);
  const differs =
    opened.kind === "open" &&
    !isLinkedDash(opened.dash, get().runningVersion, session.boardId);
  if (differs) {
    refuseDifferentDash(flow, opened.socket);
    return;
  }
  session.socket = opened.kind === "open" ? opened.socket : null;
  set({ view: VIEW_AFTER_OPEN[opened.kind] });
};

const join = async (flow: Flow): Promise<void> => {
  const { deps, session, set, get } = flow;
  const { network } = get();
  if (!deps.wifi.canJoin) return connect(flow);
  const generation = session.generation;
  set({ view: { kind: "wifi", joining: true, problem: null } });
  const outcome = await deps.wifi.join(network.ssid, network.password);
  if (session.generation !== generation) {
    if (outcome === "joined") deps.wifi.forget(network.ssid);
    return;
  }
  if (outcome !== "joined") {
    set({ view: { kind: "wifi", joining: false, problem: outcome } });
    return;
  }
  session.joinedSsid = network.ssid;
  await deps.network.save(network);
  return connect(flow, generation);
};

const workshopSocket = async ({
  deps,
  session,
}: Flow): Promise<DashSocket | null> => {
  if (session.socket !== null || !session.inWorkshop) return session.socket;
  const opened = await deps.openSocket();
  return opened.kind === "open" ? opened.socket : null;
};

const handBack = async (flow: Flow): Promise<void> => {
  const { deps, session } = flow;
  const socket = await workshopSocket(flow);
  session.socket = null;
  session.inWorkshop = false;
  if (socket !== null) await leaveWorkshop(socket);
  if (session.joinedSsid !== null) deps.wifi.forget(session.joinedSsid);
  session.joinedSsid = null;
  await deps.ble.resume();
};

const finishAfterInstall = async (
  flow: Flow,
  pkg: FirmwarePackage,
): Promise<void> => {
  const { deps, session, set } = flow;
  const total = pkg.bytes.byteLength;
  set({ view: running("restart", total, total) });
  session.socket?.close();
  session.socket = await reopenAfterRestart(deps);
  session.inWorkshop = false;
  set({ view: running("reconnect", total, total) });
  await handBack(flow);
  const version = await deps.ble.waitForDash(BLE_RETURN_TIMEOUT_MS);
  set({ view: viewAfterReturn(version, pkg.version) });
};

const AFTER_INSTALL: Record<
  InstallResult["kind"],
  (
    flow: Flow,
    result: InstallResult,
    pkg: FirmwarePackage,
  ) => Promise<void> | void
> = {
  installed: (flow, _result, pkg) => finishAfterInstall(flow, pkg),
  unconfirmed: (flow, _result, pkg) => finishAfterInstall(flow, pkg),
  cancelled: ({ set }) => {
    set({ view: { kind: "ready" } });
  },
  dropped: ({ session, set }) => {
    session.socket?.close();
    session.socket = null;
    set({ view: { kind: "failed", failure: { kind: "dropped" } } });
  },
  refused: ({ set }, result) => {
    if (result.kind !== "refused") return;
    const { code, detail } = result;
    log("warn", `Firmware update refused by the dash: ${code} ${detail ?? ""}`);
    set({
      view: { kind: "failed", failure: { kind: "refused", code, detail } },
    });
  },
};

const install = async (flow: Flow): Promise<void> => {
  const { session, set, get } = flow;
  const { pkg, view } = get();
  if (pkg === null || session.socket === null || view.kind !== "ready") return;
  const total = pkg.bytes.byteLength;
  session.cancelRequested = false;
  set({ view: running("upload", 0, total) });
  const result = await installFirmware(session.socket, pkg, {
    onProgress: (sent) => {
      set({ view: running("upload", sent, total) });
    },
    onCommitting: () => {
      set({ view: running("signature", total, total) });
    },
    isCancelled: () => session.cancelRequested,
  });
  await AFTER_INSTALL[result.kind](flow, result, pkg);
};

const openFlow = async (
  { deps, session, set }: Flow,
  pkg: FirmwarePackage,
  runningVersion: string,
  boardId: string | null,
): Promise<void> => {
  session.generation += 1;
  session.boardId = boardId;
  deps.ble.hold();
  set({ view: { kind: "prepare" }, pkg, runningVersion });
  set({ network: await deps.network.load() });
};

const retry = (flow: Flow): Promise<void> => {
  const { view } = flow.get();
  const canResume =
    view.kind === "failed" &&
    view.failure.kind === "refused" &&
    flow.session.socket !== null;
  if (canResume) {
    flow.set({ view: { kind: "ready" } });
    return Promise.resolve();
  }
  return connect(flow);
};

const close = async (flow: Flow): Promise<void> => {
  flow.session.generation += 1;
  flow.set({ view: { kind: "closed" }, pkg: null });
  await handBack(flow);
};

const actions = (flow: Flow) => ({
  open: (
    pkg: FirmwarePackage,
    runningVersion: string,
    boardId: string | null,
  ) => openFlow(flow, pkg, runningVersion, boardId),
  inWorkshop: () => {
    flow.session.inWorkshop = true;
    flow.set({ view: { kind: "wifi", joining: false, problem: null } });
  },
  setNetwork: (network: WorkshopNetwork) => {
    flow.set({ network });
  },
  join: () => join(flow),
  connect: () => connect(flow),
  install: () => install(flow),
  cancelUpload: () => {
    flow.session.cancelRequested = true;
  },
  retry: () => retry(flow),
  close: () => close(flow),
});

export const createFirmwareFlowStore = (
  deps: FirmwareFlowDeps,
): UseBoundStore<StoreApi<FirmwareFlowState>> =>
  create<FirmwareFlowState>()((set, get) => {
    const session: Session = {
      socket: null,
      joinedSsid: null,
      boardId: null,
      inWorkshop: false,
      cancelRequested: false,
      generation: 0,
    };
    return {
      view: { kind: "closed" },
      pkg: null,
      runningVersion: "",
      network: EMPTY_NETWORK,
      ...actions({ deps, session, set, get }),
    };
  });
