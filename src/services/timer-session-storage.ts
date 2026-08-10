import { File, Paths } from "expo-file-system";
import { z } from "zod";
import { log } from "../stores/log.store";
import { persist } from "../lib/persist";

const SESSIONS_FILE_NAME = "canshift-timer-sessions.json";

const sessionLapSchema = z.object({
  index: z.number().int().positive(),
  lapMs: z.number().int().nonnegative(),
  totalMs: z.number().int().nonnegative(),
});

const sessionSchema = z.object({
  key: z.string().min(1),
  startedAt: z.number(),
  laps: z.array(sessionLapSchema),
});

const sessionsSchema = z.array(sessionSchema);

export type StoredTimerSession = z.infer<typeof sessionSchema>;

export interface TimerSessionStorage {
  load: () => Promise<StoredTimerSession[]>;
  save: (sessions: readonly StoredTimerSession[]) => Promise<boolean>;
}

const sessionsFile = (): File => new File(Paths.document, SESSIONS_FILE_NAME);

export const fileTimerSessionStorage: TimerSessionStorage = {
  load: async () => {
    const { value } = await persist(
      "Reading the stored timer sessions",
      async () => {
        const file = sessionsFile();
        if (!file.exists) return [];
        const parsed = sessionsSchema.safeParse(
          JSON.parse(await file.text()) as unknown,
        );
        if (!parsed.success) {
          log("warn", "Stored timer sessions malformed — starting empty");
          return [];
        }
        return parsed.data;
      },
      [] as StoredTimerSession[],
    );
    return value;
  },

  save: async (sessions) => {
    const { failed } = await persist(
      "Persisting the timer sessions",
      () => {
        sessionsFile().write(JSON.stringify(sessions));
      },
      undefined,
    );
    return !failed;
  },
};
