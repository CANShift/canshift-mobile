import { z } from "zod";
import {
  createJsonFileStorage,
  type JsonFileStorage,
} from "../lib/json-file-storage";

const sessionLapSchema = z.object({
  index: z.number().int().positive(),
  lapMs: z.number().int().nonnegative(),
  totalMs: z.number().int().nonnegative(),
});

const sessionSchema = z.object({
  key: z.string().min(1),
  startedAt: z.number(),
  label: z.string().default(""),
  laps: z.array(sessionLapSchema),
});

export type StoredTimerSession = z.infer<typeof sessionSchema>;

export type TimerSessionStorage = JsonFileStorage<
  readonly StoredTimerSession[]
>;

export const fileTimerSessionStorage: TimerSessionStorage =
  createJsonFileStorage<readonly StoredTimerSession[]>({
    fileName: "canshift-timer-sessions.json",
    what: "timer sessions",
    schema: z.array(sessionSchema),
    empty: [],
  });
