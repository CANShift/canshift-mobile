import { useState } from "react";
import type { HistorySession } from "../lib/session-history";
import { statTiles, type StatTile } from "../lib/session-view";
import {
  EXPORTS_BY_SOURCE,
  deleteSession,
  exportSession,
  renameSession,
  type ExportKind,
} from "../services/session-actions";
import { useSessionHistory } from "./use-session-history";

export interface SessionDetailModel {
  session: HistorySession;
  tiles: readonly StatTile[];
  exports: readonly ExportKind[];
  storageNote: string | null;
  dismissStorageNote: () => void;
  confirmingDelete: boolean;
  askDelete: () => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
  rename: (label: string) => void;
  share: (kind: ExportKind) => void;
}

const useDeleteConfirmation = (onDeleted: () => void) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  return {
    confirmingDelete,
    askDelete: () => {
      setConfirmingDelete(true);
    },
    cancelDelete: () => {
      setConfirmingDelete(false);
    },
    finishDelete: (session: HistorySession) => {
      setConfirmingDelete(false);
      deleteSession(session);
      onDeleted();
    },
  };
};

export const useSessionDetail = (
  sessionKey: string,
  onDeleted: () => void,
): SessionDetailModel | null => {
  const history = useSessionHistory();
  const { finishDelete, ...confirmation } = useDeleteConfirmation(onDeleted);
  const session = history.sessions.find((s) => s.key === sessionKey);
  if (session === undefined) return null;
  return {
    session,
    tiles: statTiles(session),
    exports: EXPORTS_BY_SOURCE[session.source],
    storageNote: history.storageNote,
    dismissStorageNote: history.dismissStorageNote,
    ...confirmation,
    confirmDelete: () => {
      finishDelete(session);
    },
    rename: (label) => {
      if (label.trim() !== session.label) renameSession(session, label);
    },
    share: (kind) => void exportSession(session, kind),
  };
};
