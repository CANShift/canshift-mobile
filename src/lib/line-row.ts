import type { SavedCircuit } from "../services/circuit-storage";
import type { ArmedLine } from "../stores/circuits.store";

export type LineRowKind =
  "unset" | "unsetWithCircuits" | "nearCircuit" | "unsaved" | "saved";

export interface LineRowInput {
  lineSet: boolean;
  armed: ArmedLine | null;
  circuits: readonly SavedCircuit[];
  near: SavedCircuit | null;
}

const unsetKind = ({ circuits, near }: LineRowInput): LineRowKind => {
  if (near !== null) return "nearCircuit";
  return circuits.length > 0 ? "unsetWithCircuits" : "unset";
};

export const armedCircuit = ({
  armed,
  circuits,
}: Pick<LineRowInput, "armed" | "circuits">): SavedCircuit | null =>
  circuits.find((circuit) => circuit.id === armed?.circuitId) ?? null;

export const lineRowKind = (input: LineRowInput): LineRowKind => {
  if (!input.lineSet) return unsetKind(input);
  return armedCircuit(input) === null ? "unsaved" : "saved";
};
