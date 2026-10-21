export const memoryFiles = new Map<string, string>();

export const memoryFileFaults = { moves: false };

export const resetMemoryFileSystem = (): void => {
  memoryFiles.clear();
  memoryFileFaults.moves = false;
};

export const Paths = { document: "doc" };

export class File {
  readonly name: string;

  constructor(_dir: string, name: string) {
    this.name = name;
  }

  get exists(): boolean {
    return memoryFiles.has(this.name);
  }

  text = (): Promise<string> =>
    Promise.resolve(memoryFiles.get(this.name) ?? "");

  write = (content: string): Promise<void> => {
    memoryFiles.set(this.name, content);
    return Promise.resolve();
  };

  move = (destination: File): Promise<void> => {
    if (memoryFileFaults.moves) return Promise.reject(new Error("EACCES"));
    memoryFiles.set(destination.name, memoryFiles.get(this.name) ?? "");
    memoryFiles.delete(this.name);
    return Promise.resolve();
  };
}
