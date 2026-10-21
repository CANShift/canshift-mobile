import { z } from "zod";
import { createJsonFileStorage } from "./json-file-storage";

const mockFiles = new Map<string, string>();

jest.mock("expo-file-system", () => ({
  Paths: { document: "doc" },
  File: class {
    private readonly name: string;
    constructor(_dir: string, name: string) {
      this.name = name;
    }
    get exists(): boolean {
      return mockFiles.has(this.name);
    }
    text(): Promise<string> {
      return Promise.resolve(mockFiles.get(this.name) ?? "");
    }
    write(content: string): Promise<void> {
      mockFiles.set(this.name, content);
      return Promise.resolve();
    }
  },
}));

const storage = createJsonFileStorage({
  fileName: "numbers.json",
  what: "numbers",
  schema: z.array(z.number()),
  empty: [] as number[],
});

describe("createJsonFileStorage", () => {
  beforeEach(() => {
    mockFiles.clear();
  });

  it("reads empty when the file does not exist yet", async () => {
    await expect(storage.load()).resolves.toEqual({ value: [], failed: false });
  });

  it("round-trips what it saved", async () => {
    await expect(storage.save([1, 2])).resolves.toBe(true);
    await expect(storage.load()).resolves.toEqual({
      value: [1, 2],
      failed: false,
    });
  });

  it("reports a malformed file as a failed read", async () => {
    mockFiles.set("numbers.json", '["a"]');
    await expect(storage.load()).resolves.toEqual({ value: [], failed: true });
    mockFiles.set("numbers.json", "{");
    await expect(storage.load()).resolves.toEqual({ value: [], failed: true });
  });
});
