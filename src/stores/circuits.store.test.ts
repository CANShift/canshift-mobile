import {
  deleteCircuit,
  hydrateCircuits,
  nextCircuitName,
  rememberArmedLine,
  renameCircuit,
  saveArmedLine,
  setCircuitStorage,
  useCircuitsStore,
} from "./circuits.store";
import type { CircuitStorage, SavedCircuit } from "../services/circuit-storage";
import { CIRCUIT_STRINGS } from "../circuit-strings";

const mockToast = jest.fn();

jest.mock("../components/ui/toast", () => ({
  Toast: {
    show: (opts: unknown) => {
      mockToast(opts);
    },
  },
}));

const line = { a: { lat: 47, lng: 7 }, b: { lat: 47, lng: 7.0004 } };

const stored: SavedCircuit = {
  id: "c-1",
  name: "Lignières",
  line,
  forwardBearingDeg: 90,
  savedAt: 1,
};

interface MemoryStorage {
  storage: CircuitStorage;
  snapshot: () => readonly SavedCircuit[];
}

const memoryStorage = (
  initial: SavedCircuit[] = [],
  { loadFails = false, saveFails = false } = {},
): MemoryStorage => {
  let saved: readonly SavedCircuit[] = initial;
  return {
    storage: {
      load: () => Promise.resolve({ value: [...saved], failed: loadFails }),
      save: (circuits) => {
        if (!saveFails) saved = [...circuits];
        return Promise.resolve(!saveFails);
      },
    },
    snapshot: () => saved,
  };
};

const flush = () => new Promise((resolve) => setImmediate(resolve));

const initialState = useCircuitsStore.getState();

const hydrateWith = async (memory: MemoryStorage): Promise<void> => {
  setCircuitStorage(memory.storage);
  await hydrateCircuits();
};

const armHere = (): void => {
  rememberArmedLine({ line, forwardBearingDeg: 90, circuitId: null });
};

describe("circuits store", () => {
  beforeEach(() => {
    useCircuitsStore.setState(initialState, true);
    mockToast.mockClear();
  });

  it("hydrates the saved circuits once", async () => {
    await hydrateWith(memoryStorage([stored]));
    await hydrateWith(memoryStorage([]));
    expect(useCircuitsStore.getState().circuits).toEqual([stored]);
    expect(mockToast).not.toHaveBeenCalled();
  });

  it("saves the armed line under a cleaned name and marks it armed", async () => {
    const memory = memoryStorage();
    await hydrateWith(memory);
    armHere();
    saveArmedLine("  Home track  ", 42);
    await flush();
    const [saved] = memory.snapshot();
    expect(saved).toEqual({
      id: "c-42",
      name: "Home track",
      line,
      forwardBearingDeg: 90,
      savedAt: 42,
    });
    expect(useCircuitsStore.getState().armed?.circuitId).toBe("c-42");
  });

  it("refuses an empty name or a missing line", async () => {
    const memory = memoryStorage();
    await hydrateWith(memory);
    saveArmedLine("Nowhere");
    armHere();
    saveArmedLine("   ");
    await flush();
    expect(memory.snapshot()).toEqual([]);
  });

  it("numbers the default name after the saved circuits", async () => {
    await hydrateWith(memoryStorage([stored]));
    expect(nextCircuitName()).toBe(CIRCUIT_STRINGS.defaultName(2));
  });

  it("renames and deletes, and forgets the armed circuit it deletes", async () => {
    const memory = memoryStorage([stored]);
    await hydrateWith(memory);
    rememberArmedLine({ line, forwardBearingDeg: 90, circuitId: "c-1" });
    renameCircuit("c-1", "Lignières short");
    await flush();
    expect(memory.snapshot()[0]?.name).toBe("Lignières short");
    deleteCircuit("c-1");
    await flush();
    expect(memory.snapshot()).toEqual([]);
    expect(useCircuitsStore.getState().armed?.circuitId).toBeNull();
  });

  it("tells the driver once when the circuits can't be read", async () => {
    await hydrateWith(memoryStorage([], { loadFails: true }));
    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith({
      type: "error",
      text1: CIRCUIT_STRINGS.unreadable,
    });
  });

  it("keeps the circuit in memory and tells the driver when saving fails", async () => {
    await hydrateWith(memoryStorage([], { saveFails: true }));
    armHere();
    saveArmedLine("Home");
    await flush();
    expect(useCircuitsStore.getState().circuits).toHaveLength(1);
    expect(mockToast).toHaveBeenCalledWith({
      type: "error",
      text1: CIRCUIT_STRINGS.unsaved,
    });
  });

  it("keeps a circuit saved before hydration and writes it back", async () => {
    const memory = memoryStorage([stored]);
    setCircuitStorage(memory.storage);
    armHere();
    saveArmedLine("Early", 7);
    await hydrateCircuits();
    await flush();
    expect(memory.snapshot().map((c) => c.id)).toEqual(["c-1", "c-7"]);
  });
});
