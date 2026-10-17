import { Linking } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { useFirmwareFlowStore } from "../stores/firmware-stores";
import { dashWifi } from "../services/workshop/dash-wifi";
import type { FlowView } from "../services/workshop/firmware-flow-types";
import type { WorkshopNetwork } from "../services/workshop/workshop-network";

export interface FirmwareFlowModel {
  view: FlowView;
  targetVersion: string;
  runningVersion: string;
  network: WorkshopNetwork;
  canJoinFromApp: boolean;
  setNetwork: (network: WorkshopNetwork) => void;
  inWorkshop: () => void;
  join: () => void;
  connect: () => void;
  install: () => void;
  cancelUpload: () => void;
  retry: () => void;
  close: () => void;
  openSettings: () => void;
}

export const useFirmwareFlow = (): FirmwareFlowModel => {
  const state = useFirmwareFlowStore(
    useShallow((s) => ({
      view: s.view,
      targetVersion: s.pkg?.version ?? "",
      runningVersion: s.runningVersion,
      network: s.network,
    })),
  );
  const actions = useFirmwareFlowStore.getState();
  return {
    ...state,
    canJoinFromApp: dashWifi.canJoin,
    setNetwork: actions.setNetwork,
    inWorkshop: actions.inWorkshop,
    join: () => void actions.join(),
    connect: () => void actions.connect(),
    install: () => void actions.install(),
    cancelUpload: actions.cancelUpload,
    retry: () => void actions.retry(),
    close: () => void actions.close(),
    openSettings: () => void Linking.openSettings(),
  };
};
