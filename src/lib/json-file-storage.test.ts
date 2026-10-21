import { z } from "zod";
import { createJsonFileStorage } from "./json-file-storage";
import {
  memoryFileFaults,
  memoryFiles,
  resetMemoryFileSystem,
} from "../testing/memory-file-system";

jest.mock("expo-file-system", () =>
  jest.requireActual<typeof import("../testing/memory-file-system")>(
    "../testing/memory-file-system",
  ),
);

const storage = createJsonFileStorage({
  fileName: "numbers.json",
  what: "numbers",
  schema: z.array(z.number()),
  empty: [] as number[],
});

const setAsideFiles = (): string[] =>
  [...memoryFiles.keys()].filter((name) =>
    /^numbers\.unreadable-\d+\.json$/.test(name),
  );

describe("createJsonFileStorage", () => {
  beforeEach(() => {
    resetMemoryFileSystem();
  });

  it("reads empty when the file does not exist yet", async () => {
    await expect(storage.load()).resolves.toEqual({
      value: [],
      failure: null,
    });
  });

  it("round-trips what it saved", async () => {
    await expect(storage.save([1, 2])).resolves.toBe(true);
    await expect(storage.load()).resolves.toEqual({
      value: [1, 2],
      failure: null,
    });
  });

  it.each(['["a"]', "{"])(
    "sets an unreadable file (%s) aside and saves normally afterwards",
    async (content) => {
      memoryFiles.set("numbers.json", content);
      await expect(storage.load()).resolves.toEqual({
        value: [],
        failure: "set-aside",
      });
      expect(setAsideFiles().map((name) => memoryFiles.get(name))).toEqual([
        content,
      ]);

      await expect(storage.save([3])).resolves.toBe(true);
      await expect(storage.load()).resolves.toEqual({
        value: [3],
        failure: null,
      });
    },
  );

  it("keeps the file and refuses writes when it can't be set aside", async () => {
    memoryFiles.set("numbers.json", "{");
    memoryFileFaults.moves = true;

    await expect(storage.load()).resolves.toEqual({
      value: [],
      failure: "kept",
    });
    await expect(storage.save([3])).resolves.toBe(false);
    expect(memoryFiles.get("numbers.json")).toBe("{");
    expect(setAsideFiles()).toEqual([]);
  });
});
