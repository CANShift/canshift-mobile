import { STRINGS } from "../strings";
import type { FirmwareCard } from "../stores/firmware-release.store";
import type { DownloadProblem } from "../services/workshop/firmware-download";

const F = STRINGS.firmware;

export type CardAction = "check" | "download" | "update";

export interface FirmwareCardView {
  latest: string | null;
  message: string;
  action: CardAction | null;
  actionLabel: string;
  busy: boolean;
}

const DOWNLOAD_PROBLEMS: Record<DownloadProblem, string> = {
  offline: F.offline,
  damaged: F.damaged,
  notFirmware: F.notFirmware,
  badSignature: F.badSignature,
};

const idle = (message: string, busy = false): FirmwareCardView => ({
  latest: null,
  message,
  action: null,
  actionLabel: "",
  busy,
});

type CardKind = FirmwareCard["kind"];
type CardOf<K extends CardKind> = Extract<FirmwareCard, { kind: K }>;

const VIEWS: { [K in CardKind]: (card: CardOf<K>) => FirmwareCardView } = {
  idle: () => idle(F.checking, true),
  checking: () => idle(F.checking, true),
  unsupported: () => idle(F.unsupported),
  noBuild: () => idle(F.noBuild),
  unavailable: () => ({
    ...idle(F.unavailable),
    action: "check",
    actionLabel: F.tryAgain,
  }),
  upToDate: ({ release }) => ({ ...idle(F.upToDate), latest: release.version }),
  available: ({ release }) => ({
    latest: release.version,
    message: F.available(release.version),
    action: "download",
    actionLabel: F.download(release.sizeBytes),
    busy: false,
  }),
  downloading: ({ release }) => ({
    ...idle(F.downloading, true),
    latest: release.version,
  }),
  downloadFailed: ({ release, problem }) => ({
    latest: release.version,
    message: DOWNLOAD_PROBLEMS[problem],
    action: "download",
    actionLabel: F.tryAgain,
    busy: false,
  }),
  ready: ({ release }) => ({
    latest: release.version,
    message: F.ready,
    action: "update",
    actionLabel: F.update,
    busy: false,
  }),
};

const viewOf = <K extends CardKind>(
  kind: K,
  card: CardOf<K>,
): FirmwareCardView => VIEWS[kind](card);

export const firmwareCardView = (card: FirmwareCard): FirmwareCardView =>
  viewOf(card.kind, card);
