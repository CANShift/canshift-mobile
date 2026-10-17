import { CryptoDigestAlgorithm, digest } from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import type { FetchJson } from "./firmware-release";

const FIRMWARE_CACHE_DIR = "firmware";
const GITHUB_JSON = "application/vnd.github+json";
const HEX_RADIX = 16;
const BYTE_HEX_DIGITS = 2;

export class HttpStatusError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${String(status)}`);
    this.name = "HttpStatusError";
  }
}

export const fetchGithubJson: FetchJson = async (url) => {
  const response = await fetch(url, { headers: { Accept: GITHUB_JSON } });
  if (!response.ok) throw new HttpStatusError(response.status);
  return response.json();
};

const cachedFile = (name: string): File => {
  const dir = new Directory(Paths.cache, FIRMWARE_CACHE_DIR);
  dir.create({ intermediates: true, idempotent: true });
  return new File(dir, name);
};

export const fetchFirmwareFile = async (
  url: string,
  name: string,
): Promise<Uint8Array> => {
  const target = cachedFile(name);
  if (target.exists) return target.bytes();
  const file = await File.downloadFileAsync(url, target);
  return file.bytes();
};

export const discardFirmwareFiles = (): void => {
  const dir = new Directory(Paths.cache, FIRMWARE_CACHE_DIR);
  if (dir.exists) dir.delete();
};

export const sha256Hex = async (bytes: Uint8Array): Promise<string> => {
  const hash = new Uint8Array(
    await digest(CryptoDigestAlgorithm.SHA256, bytes.slice()),
  );
  return Array.from(hash, (byte) =>
    byte.toString(HEX_RADIX).padStart(BYTE_HEX_DIGITS, "0"),
  ).join("");
};
