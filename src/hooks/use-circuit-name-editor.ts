import { useState } from "react";
import {
  nextCircuitName,
  renameCircuit,
  saveArmedLine,
} from "../stores/circuits.store";
import type { SavedCircuit } from "../services/circuit-storage";

type CircuitNameEdit = { kind: "save" } | { kind: "rename"; id: string };

export interface CircuitNameEditor {
  edit: CircuitNameEdit | null;
  draft: string;
  setDraft: (draft: string) => void;
  startSave: () => void;
  startRename: (circuit: SavedCircuit) => void;
  submitName: () => void;
  cancelName: () => void;
}

const applyEdit = (edit: CircuitNameEdit, name: string): void => {
  if (edit.kind === "save") saveArmedLine(name);
  else renameCircuit(edit.id, name);
};

export const useCircuitNameEditor = (): CircuitNameEditor => {
  const [edit, setEdit] = useState<CircuitNameEdit | null>(null);
  const [draft, setDraft] = useState("");
  const open = (next: CircuitNameEdit, name: string): void => {
    setDraft(name);
    setEdit(next);
  };
  return {
    edit,
    draft,
    setDraft,
    startSave: () => {
      open({ kind: "save" }, nextCircuitName());
    },
    startRename: (circuit) => {
      open({ kind: "rename", id: circuit.id }, circuit.name);
    },
    submitName: () => {
      if (edit !== null) applyEdit(edit, draft);
      setEdit(null);
    },
    cancelName: () => {
      setEdit(null);
    },
  };
};
