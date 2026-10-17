import { useDeviceStore } from "../stores/device.store";
import {
  useFirmwareFlowStore,
  useFirmwareReleaseStore,
} from "../stores/firmware-stores";
import {
  firmwareCardView,
  type CardAction,
  type FirmwareCardView,
} from "../lib/firmware-card-view";
import type { FirmwareCard } from "../stores/firmware-release.store";
import { NO_VALUE } from "../lib/tile-state";
import { STRINGS } from "../strings";
import { useLink } from "./use-link";

export interface FirmwareCardModel extends FirmwareCardView {
  running: string;
  onAction: () => void;
}

const ACTIONS: Record<
  CardAction,
  (card: FirmwareCard, running: string) => void
> = {
  check: () => {
    const { boardId, firmwareVersion } = useDeviceStore.getState();
    if (boardId === null || firmwareVersion === null) return;
    void useFirmwareReleaseStore.getState().check(boardId, firmwareVersion);
  },
  download: () => void useFirmwareReleaseStore.getState().download(),
  update: (card, running) => {
    if (card.kind !== "ready") return;
    void useFirmwareFlowStore.getState().open(card.pkg, running);
  },
};

const NOT_CONNECTED: FirmwareCardView = {
  latest: null,
  message: STRINGS.firmware.connectFirst,
  action: null,
  actionLabel: "",
  busy: false,
};

export const useFirmwareCard = (): FirmwareCardModel => {
  const linked = useLink() === "connected";
  const running = useDeviceStore((s) => s.firmwareVersion) ?? NO_VALUE;
  const card = useFirmwareReleaseStore((s) => s.card);
  const view = linked ? firmwareCardView(card) : NOT_CONNECTED;
  return {
    ...view,
    running,
    onAction: () => {
      if (view.action !== null) ACTIONS[view.action](card, running);
    },
  };
};
