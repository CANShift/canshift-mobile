import { z } from "zod";
import {
  createJsonFileStorage,
  type JsonFileStorage,
} from "../lib/json-file-storage";

const pointSchema = z.object({ lat: z.number(), lng: z.number() });

const circuitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  line: z.object({ a: pointSchema, b: pointSchema }),
  forwardBearingDeg: z.number(),
  savedAt: z.number(),
});

export type SavedCircuit = z.infer<typeof circuitSchema>;

export type CircuitStorage = JsonFileStorage<readonly SavedCircuit[]>;

export const fileCircuitStorage: CircuitStorage = createJsonFileStorage<
  readonly SavedCircuit[]
>({
  fileName: "canshift-circuits.json",
  what: "saved circuits",
  schema: z.array(circuitSchema),
  empty: [],
});
