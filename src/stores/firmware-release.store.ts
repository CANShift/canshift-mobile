import { create, type StoreApi, type UseBoundStore } from "zustand";
import { hasWorkshopMode } from "../lib/workshop-boards";
import { isNewerThan } from "../lib/firmware-version";
import { errText } from "../lib/error-text";
import { log } from "./log.store";
import {
  findLatestFirmware,
  type FetchJson,
  type FirmwareRelease,
} from "../services/workshop/firmware-release";
import {
  downloadFirmware,
  type DownloadDeps,
  type DownloadProblem,
  type DownloadResult,
} from "../services/workshop/firmware-download";
import type { FirmwarePackage } from "../services/workshop/ota-install";

export type FirmwareCard =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "unsupported" }
  | { kind: "noBuild" }
  | { kind: "unavailable" }
  | { kind: "upToDate"; release: FirmwareRelease }
  | { kind: "available"; release: FirmwareRelease }
  | { kind: "downloading"; release: FirmwareRelease }
  | {
      kind: "downloadFailed";
      release: FirmwareRelease;
      problem: DownloadProblem;
    }
  | { kind: "ready"; release: FirmwareRelease; pkg: FirmwarePackage };

export interface FirmwareReleaseDeps extends DownloadDeps {
  fetchJson: FetchJson;
}

interface FirmwareReleaseState {
  card: FirmwareCard;
  check: (boardId: string, running: string) => Promise<void>;
  download: () => Promise<void>;
}

type Set = (patch: Partial<FirmwareReleaseState>) => void;
type Get = () => FirmwareReleaseState;

const cardFor = (release: FirmwareRelease, running: string): FirmwareCard =>
  isNewerThan(release.version, running)
    ? { kind: "available", release }
    : { kind: "upToDate", release };

const lookUp = async (
  deps: FirmwareReleaseDeps,
  boardId: string,
  running: string,
): Promise<FirmwareCard> => {
  try {
    const lookup = await findLatestFirmware(deps.fetchJson, boardId);
    if (lookup.kind !== "found") return { kind: lookup.kind };
    return cardFor(lookup.release, running);
  } catch (err) {
    log("warn", `Firmware release check failed: ${errText(err)}`);
    return { kind: "unavailable" };
  }
};

const fetchPackage = async (
  deps: FirmwareReleaseDeps,
  release: FirmwareRelease,
): Promise<DownloadResult> => {
  try {
    return await downloadFirmware(release, deps);
  } catch (err) {
    log("warn", `Firmware download failed: ${errText(err)}`);
    return { kind: "failed", problem: "offline" };
  }
};

const runCheck =
  (deps: FirmwareReleaseDeps, set: Set, get: Get) =>
  async (boardId: string, running: string): Promise<void> => {
    if (!hasWorkshopMode(boardId)) {
      set({ card: { kind: "unsupported" } });
      return;
    }
    if (get().card.kind === "checking") return;
    set({ card: { kind: "checking" } });
    set({ card: await lookUp(deps, boardId, running) });
  };

const runDownload =
  (deps: FirmwareReleaseDeps, set: Set, get: Get) =>
  async (): Promise<void> => {
    const { card } = get();
    if (card.kind !== "available" && card.kind !== "downloadFailed") return;
    const { release } = card;
    set({ card: { kind: "downloading", release } });
    const result = await fetchPackage(deps, release);
    set({
      card:
        result.kind === "ready"
          ? { kind: "ready", release, pkg: result.pkg }
          : { kind: "downloadFailed", release, problem: result.problem },
    });
  };

export const createFirmwareReleaseStore = (
  deps: FirmwareReleaseDeps,
): UseBoundStore<StoreApi<FirmwareReleaseState>> =>
  create<FirmwareReleaseState>()((set, get) => ({
    card: { kind: "idle" },
    check: runCheck(deps, set, get),
    download: runDownload(deps, set, get),
  }));
