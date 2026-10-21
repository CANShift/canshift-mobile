import { File, Paths } from "expo-file-system";
import type { z } from "zod";
import { log } from "../stores/log.store";
import { persist, type PersistResult } from "./persist";

export interface JsonFileSpec<T> {
  fileName: string;
  what: string;
  schema: z.ZodType<T>;
  empty: T;
}

export interface JsonFileStorage<T> {
  load: () => Promise<PersistResult<T>>;
  save: (value: T) => Promise<boolean>;
}

const readParsed = async <T>(spec: JsonFileSpec<T>): Promise<T> => {
  const file = new File(Paths.document, spec.fileName);
  if (!file.exists) return spec.empty;
  const parsed = spec.schema.safeParse(JSON.parse(await file.text()));
  if (parsed.success) return parsed.data;
  log("warn", `Stored ${spec.what} malformed — starting empty`);
  return spec.empty;
};

export const createJsonFileStorage = <T>(
  spec: JsonFileSpec<T>,
): JsonFileStorage<T> => ({
  load: () =>
    persist(
      `Reading the stored ${spec.what}`,
      () => readParsed(spec),
      spec.empty,
    ),
  save: async (value) => {
    const { failed } = await persist(
      `Persisting the ${spec.what}`,
      async () => {
        await new File(Paths.document, spec.fileName).write(
          JSON.stringify(value),
        );
      },
      undefined,
    );
    return !failed;
  },
});
