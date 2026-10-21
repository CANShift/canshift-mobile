import { create } from "zustand";
import type { startFinishLineFromPosition } from "@canshift/core/track";
import { Toast } from "../components/ui/toast";
import { CIRCUIT_STRINGS } from "../circuit-strings";
import {
  fileCircuitStorage,
  type CircuitStorage,
  type SavedCircuit,
} from "../services/circuit-storage";

export const MAX_CIRCUIT_NAME_LENGTH = 40;

type StartFinishLine = ReturnType<typeof startFinishLineFromPosition>;

export interface ArmedLine extends StartFinishLine {
  circuitId: string | null;
}

interface CircuitsState {
  hydrated: boolean;
  circuits: SavedCircuit[];
  armed: ArmedLine | null;
}

let activeStorage: CircuitStorage = fileCircuitStorage;

export const setCircuitStorage = (storage: CircuitStorage): void => {
  activeStorage = storage;
};

export const useCircuitsStore = create<CircuitsState>()(() => ({
  hydrated: false,
  circuits: [],
  armed: null,
}));

const announce = (message: string): void => {
  Toast.show({ type: "error", text1: message });
};

const persistCircuits = (circuits: readonly SavedCircuit[]): void => {
  void activeStorage.save(circuits).then((persisted) => {
    if (!persisted) announce(CIRCUIT_STRINGS.unsaved);
  });
};

const commit = (circuits: SavedCircuit[]): void => {
  useCircuitsStore.setState({ circuits });
  if (useCircuitsStore.getState().hydrated) persistCircuits(circuits);
};

export const hydrateCircuits = async (): Promise<void> => {
  if (useCircuitsStore.getState().hydrated) return;
  const { value, failed } = await activeStorage.load();
  const savedBeforeHydration = useCircuitsStore.getState().circuits;
  const circuits = [...value, ...savedBeforeHydration];
  useCircuitsStore.setState({ hydrated: true, circuits });
  if (failed) announce(CIRCUIT_STRINGS.unreadable);
  if (savedBeforeHydration.length > 0) persistCircuits(circuits);
};

const cleanCircuitName = (name: string): string =>
  name.trim().slice(0, MAX_CIRCUIT_NAME_LENGTH);

export const nextCircuitName = (): string =>
  CIRCUIT_STRINGS.defaultName(useCircuitsStore.getState().circuits.length + 1);

export const rememberArmedLine = (armed: ArmedLine | null): void => {
  useCircuitsStore.setState({ armed });
};

export const saveArmedLine = (
  name: string,
  nowMs: number = Date.now(),
): void => {
  const { armed, circuits } = useCircuitsStore.getState();
  const cleanName = cleanCircuitName(name);
  if (armed === null || cleanName === "") return;
  const circuit: SavedCircuit = {
    id: `c-${String(nowMs)}`,
    name: cleanName,
    line: armed.line,
    forwardBearingDeg: armed.forwardBearingDeg,
    savedAt: nowMs,
  };
  useCircuitsStore.setState({ armed: { ...armed, circuitId: circuit.id } });
  commit([...circuits, circuit]);
};

export const renameCircuit = (id: string, name: string): void => {
  const cleanName = cleanCircuitName(name);
  if (cleanName === "") return;
  commit(
    useCircuitsStore
      .getState()
      .circuits.map((circuit) =>
        circuit.id === id ? { ...circuit, name: cleanName } : circuit,
      ),
  );
};

export const deleteCircuit = (id: string): void => {
  const { armed, circuits } = useCircuitsStore.getState();
  if (armed?.circuitId === id)
    useCircuitsStore.setState({ armed: { ...armed, circuitId: null } });
  commit(circuits.filter((circuit) => circuit.id !== id));
};
