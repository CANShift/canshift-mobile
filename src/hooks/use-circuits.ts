import { useEffect, useState } from "react";
import { hydrateCircuits, useCircuitsStore } from "../stores/circuits.store";
import {
  getLatestSample,
  useTrackSessionStore,
} from "../stores/track-session.store";
import type { SavedCircuit } from "../services/circuit-storage";
import { nearestCircuit } from "../lib/nearest-circuit";
import { armedCircuit, lineRowKind, type LineRowKind } from "../lib/line-row";
import {
  useCircuitNameEditor,
  type CircuitNameEditor,
} from "./use-circuit-name-editor";
import { useCircuitDelete, type CircuitDelete } from "./use-circuit-delete";

export interface CircuitsModel extends CircuitNameEditor, CircuitDelete {
  circuits: readonly SavedCircuit[];
  near: SavedCircuit | null;
  rowKind: LineRowKind;
  armedName: string | null;
  sheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}

const useNearestCircuit = (
  circuits: readonly SavedCircuit[],
  lineSet: boolean,
): SavedCircuit | null => {
  useTrackSessionStore((s) => s.writeIndex);
  if (lineSet) return null;
  return nearestCircuit(circuits, getLatestSample());
};

const useCircuitsSheet = (): Pick<
  CircuitsModel,
  "sheetOpen" | "openSheet" | "closeSheet"
> => {
  const [sheetOpen, setSheetOpen] = useState(false);
  return {
    sheetOpen,
    openSheet: () => {
      setSheetOpen(true);
    },
    closeSheet: () => {
      setSheetOpen(false);
    },
  };
};

export const useCircuits = (fixReady: boolean): CircuitsModel => {
  useEffect(() => {
    void hydrateCircuits();
  }, []);
  const circuits = useCircuitsStore((s) => s.circuits);
  const armed = useCircuitsStore((s) => s.armed);
  const lineSet = useTrackSessionStore((s) => s.startFinishSet);
  const nearby = useNearestCircuit(circuits, lineSet);
  const near = fixReady ? nearby : null;
  return {
    circuits,
    near,
    rowKind: lineRowKind({ lineSet, armed, circuits, near }),
    armedName: armedCircuit({ armed, circuits })?.name ?? null,
    ...useCircuitsSheet(),
    ...useCircuitNameEditor(),
    ...useCircuitDelete(),
  };
};
