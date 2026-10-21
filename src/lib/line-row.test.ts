import { lineRowKind, type LineRowInput } from "./line-row";
import type { SavedCircuit } from "../services/circuit-storage";

const circuit: SavedCircuit = {
  id: "c-1",
  name: "Lignières",
  line: { a: { lat: 47, lng: 7 }, b: { lat: 47, lng: 7.0004 } },
  forwardBearingDeg: 0,
  savedAt: 1,
};

const armed = { line: circuit.line, forwardBearingDeg: 0 };

const input = (overrides: Partial<LineRowInput>): LineRowInput => ({
  lineSet: false,
  armed: null,
  circuits: [],
  near: null,
  ...overrides,
});

describe("lineRowKind", () => {
  it.each<[string, Partial<LineRowInput>, string]>([
    ["no line and no circuits", {}, "unset"],
    [
      "no line with saved circuits",
      { circuits: [circuit] },
      "unsetWithCircuits",
    ],
    [
      "no line near a saved circuit",
      { circuits: [circuit], near: circuit },
      "nearCircuit",
    ],
    [
      "a line placed here",
      { lineSet: true, armed: { ...armed, circuitId: null } },
      "unsaved",
    ],
    [
      "a line from a saved circuit",
      {
        lineSet: true,
        armed: { ...armed, circuitId: "c-1" },
        circuits: [circuit],
      },
      "saved",
    ],
    [
      "a line whose circuit was deleted",
      { lineSet: true, armed: { ...armed, circuitId: "c-1" } },
      "unsaved",
    ],
  ])("%s is %s", (_label, overrides, kind) => {
    expect(lineRowKind(input(overrides))).toBe(kind);
  });
});
