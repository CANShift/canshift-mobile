import { SIGNATURE_BYTES, appImageVersion } from "../../lib/firmware-image";
import type { FirmwareRelease } from "./firmware-release";
import type { FirmwarePackage } from "./ota-install";

export type DownloadProblem =
  "offline" | "damaged" | "notFirmware" | "badSignature";

export type DownloadResult =
  | { kind: "ready"; pkg: FirmwarePackage }
  | { kind: "failed"; problem: DownloadProblem };

export interface DownloadDeps {
  fetchFile: (url: string, name: string) => Promise<Uint8Array>;
  sha256Hex: (bytes: Uint8Array) => Promise<string>;
  discardCache: () => void;
}

const SIGNATURE_FILE_SUFFIX = ".sig";

const checkFiles = async (
  release: FirmwareRelease,
  bytes: Uint8Array,
  signature: Uint8Array,
  deps: DownloadDeps,
): Promise<DownloadResult> => {
  const sha256 = await deps.sha256Hex(bytes);
  if (sha256 !== release.sha256) return { kind: "failed", problem: "damaged" };
  const version = appImageVersion(bytes);
  if (version === null) return { kind: "failed", problem: "notFirmware" };
  if (signature.byteLength !== SIGNATURE_BYTES) {
    return { kind: "failed", problem: "badSignature" };
  }
  return { kind: "ready", pkg: { bytes, signature, sha256, version } };
};

export const downloadFirmware = async (
  release: FirmwareRelease,
  deps: DownloadDeps,
): Promise<DownloadResult> => {
  const bytes = await deps.fetchFile(release.binUrl, release.binName);
  const signature = await deps.fetchFile(
    release.sigUrl,
    `${release.binName}${SIGNATURE_FILE_SUFFIX}`,
  );
  const result = await checkFiles(release, bytes, signature, deps);
  if (result.kind === "failed") deps.discardCache();
  return result;
};
