import { File, Paths } from "expo-file-system";
import type { z } from "zod";
import { log } from "../stores/log.store";
import { persist } from "./persist";

export interface JsonFileSpec<T> {
  fileName: string;
  what: string;
  schema: z.ZodType<T>;
  empty: T;
}

export type ReadFailure = "set-aside" | "kept";

interface LoadResult<T> {
  value: T;
  failure: ReadFailure | null;
}

export interface JsonFileStorage<T> {
  load: () => Promise<LoadResult<T>>;
  save: (value: T) => Promise<boolean>;
}

const documentFile = (name: string): File => new File(Paths.document, name);

const setAsideName = (fileName: string, nowMs: number): string =>
  `${fileName.replace(/\.json$/, "")}.unreadable-${String(nowMs)}.json`;

const setAside = async <T>(spec: JsonFileSpec<T>): Promise<ReadFailure> => {
  const { failed } = await persist(
    `Setting aside the unreadable ${spec.what}`,
    () =>
      documentFile(spec.fileName).move(
        documentFile(setAsideName(spec.fileName, Date.now())),
      ),
    undefined,
  );
  return failed ? "kept" : "set-aside";
};

const loadFile = async <T>(spec: JsonFileSpec<T>): Promise<LoadResult<T>> => {
  const file = documentFile(spec.fileName);
  if (!file.exists) return { value: spec.empty, failure: null };
  const { value, failed } = await persist(
    `Reading the stored ${spec.what}`,
    async () => spec.schema.parse(JSON.parse(await file.text())),
    spec.empty,
  );
  if (!failed) return { value, failure: null };
  return { value, failure: await setAside(spec) };
};

const saveFile = async <T>(
  spec: JsonFileSpec<T>,
  value: T,
): Promise<boolean> => {
  const { failed } = await persist(
    `Persisting the ${spec.what}`,
    () => documentFile(spec.fileName).write(JSON.stringify(value)),
    undefined,
  );
  return !failed;
};

export const createJsonFileStorage = <T>(
  spec: JsonFileSpec<T>,
): JsonFileStorage<T> => {
  let writesBlocked = false;
  return {
    load: async () => {
      const result = await loadFile(spec);
      writesBlocked = result.failure === "kept";
      return result;
    },
    save: (value) => {
      if (!writesBlocked) return saveFile(spec, value);
      log("warn", `Persisting the ${spec.what} skipped: unreadable file kept`);
      return Promise.resolve(false);
    },
  };
};
