import { createHash } from "node:crypto";
import { downloadFirmware, type DownloadDeps } from "./firmware-download";
import type { FirmwareRelease } from "./firmware-release";
import { buildAppImage } from "../../testing/app-image";

const IMAGE = buildAppImage("0.21.0", 4_096);
const SIGNATURE = new Uint8Array(64).fill(3);
const hashOf = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

const RELEASE: FirmwareRelease = {
  version: "0.21.0",
  binName: "canshift-esp32s3-v0.21.0-firmware.bin",
  binUrl: "https://example.test/fw.bin",
  sigUrl: "https://example.test/fw.bin.sig",
  sizeBytes: IMAGE.byteLength,
  sha256: hashOf(IMAGE),
};

const depsServing = (
  bin: Uint8Array,
  sig: Uint8Array,
): DownloadDeps & { discardCache: jest.Mock } => ({
  fetchFile: (url) => Promise.resolve(url === RELEASE.binUrl ? bin : sig),
  sha256Hex: (bytes) => Promise.resolve(hashOf(bytes)),
  discardCache: jest.fn(),
});

describe("downloadFirmware", () => {
  it("returns the checked package with the version read from the image", async () => {
    const deps = depsServing(IMAGE, SIGNATURE);
    expect(await downloadFirmware(RELEASE, deps)).toEqual({
      kind: "ready",
      pkg: {
        bytes: IMAGE,
        signature: SIGNATURE,
        sha256: RELEASE.sha256,
        version: "0.21.0",
      },
    });
    expect(deps.discardCache).not.toHaveBeenCalled();
  });

  it.each([
    ["damaged", depsServing(buildAppImage("0.21.1", 4_096), SIGNATURE)],
    ["badSignature", depsServing(IMAGE, new Uint8Array(12))],
  ] as const)(
    "refuses a %s download and drops the cached files",
    async (problem, deps) => {
      expect(await downloadFirmware(RELEASE, deps)).toEqual({
        kind: "failed",
        problem,
      });
      expect(deps.discardCache).toHaveBeenCalledTimes(1);
    },
  );

  it("refuses a file that is not an app image", async () => {
    const merged = new Uint8Array(4_096);
    const deps = depsServing(merged, SIGNATURE);
    expect(
      await downloadFirmware({ ...RELEASE, sha256: hashOf(merged) }, deps),
    ).toEqual({
      kind: "failed",
      problem: "notFirmware",
    });
  });
});
