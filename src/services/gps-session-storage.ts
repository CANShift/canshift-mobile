import { z } from "zod";
import {
  createJsonFileStorage,
  type JsonFileStorage,
} from "../lib/json-file-storage";

const lapSchema = z.object({
  number: z.number().int().positive(),
  startMs: z.number(),
  endMs: z.number(),
  durationMs: z.number().nonnegative(),
});

const tracePointSchema = z.object({
  t: z.number(),
  lat: z.number(),
  lng: z.number(),
  speedMs: z.number(),
});

const gpsSessionSchema = z.object({
  key: z.string().min(1),
  startedAt: z.number(),
  label: z.string().default(""),
  laps: z.array(lapSchema),
  maxSpeedMs: z.number(),
  trace: z.array(tracePointSchema),
});

export type StoredGpsSession = z.infer<typeof gpsSessionSchema>;

export type TracePoint = z.infer<typeof tracePointSchema>;

export type GpsSessionStorage = JsonFileStorage<readonly StoredGpsSession[]>;

export const fileGpsSessionStorage: GpsSessionStorage = createJsonFileStorage<
  readonly StoredGpsSession[]
>({
  fileName: "canshift-gps-sessions.json",
  what: "GPS sessions",
  schema: z.array(gpsSessionSchema),
  empty: [],
});
