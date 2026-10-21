import { File, Paths } from "expo-file-system";
import { z } from "zod";
import { persist, type PersistResult } from "../lib/persist";

const CIRCUITS_FILE_NAME = "canshift-circuits.json";

const pointSchema = z.object({ lat: z.number(), lng: z.number() });

const circuitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  line: z.object({ a: pointSchema, b: pointSchema }),
  forwardBearingDeg: z.number(),
  savedAt: z.number(),
});

const circuitsSchema = z.array(circuitSchema);

export type SavedCircuit = z.infer<typeof circuitSchema>;

export interface CircuitStorage {
  load: () => Promise<PersistResult<SavedCircuit[]>>;
  save: (circuits: readonly SavedCircuit[]) => Promise<boolean>;
}

const circuitsFile = (): File => new File(Paths.document, CIRCUITS_FILE_NAME);

const readCircuits = async (): Promise<SavedCircuit[]> => {
  const file = circuitsFile();
  if (!file.exists) return [];
  return circuitsSchema.parse(JSON.parse(await file.text()) as unknown);
};

export const fileCircuitStorage: CircuitStorage = {
  load: () => persist("Reading the saved circuits", readCircuits, []),

  save: async (circuits) => {
    const { failed } = await persist(
      "Persisting the saved circuits",
      async () => {
        await circuitsFile().write(JSON.stringify(circuits));
      },
      undefined,
    );
    return !failed;
  },
};
