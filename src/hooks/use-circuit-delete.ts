import { useState } from "react";
import { deleteCircuit } from "../stores/circuits.store";
import type { SavedCircuit } from "../services/circuit-storage";

export interface CircuitDelete {
  deleting: SavedCircuit | null;
  askDelete: (circuit: SavedCircuit) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
}

export const useCircuitDelete = (): CircuitDelete => {
  const [deleting, setDeleting] = useState<SavedCircuit | null>(null);
  return {
    deleting,
    askDelete: setDeleting,
    confirmDelete: () => {
      if (deleting !== null) deleteCircuit(deleting.id);
      setDeleting(null);
    },
    cancelDelete: () => {
      setDeleting(null);
    },
  };
};
