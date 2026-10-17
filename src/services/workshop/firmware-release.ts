import { z } from "zod";

export const RELEASES_URL =
  "https://api.github.com/repos/CANShift/canshift-firmware/releases?per_page=10";
const MANIFEST_ASSET = "manifest.json";
const SIGNATURE_SUFFIX = ".sig";
const SHA256_HEX = /^[0-9a-f]{64}$/i;

export interface FirmwareRelease {
  version: string;
  binName: string;
  binUrl: string;
  sigUrl: string;
  sizeBytes: number;
  sha256: string;
}

export type ReleaseLookup =
  | { kind: "found"; release: FirmwareRelease }
  | { kind: "noBuild" }
  | { kind: "unavailable" };

export type FetchJson = (url: string) => Promise<unknown>;

const AssetSchema = z
  .object({
    name: z.string(),
    browser_download_url: z.string(),
    size: z.number(),
  })
  .loose();

const ReleaseSchema = z
  .object({ draft: z.boolean(), assets: z.array(AssetSchema) })
  .loose();

const ManifestSchema = z
  .object({
    version: z.string(),
    firmwares: z.record(
      z.string(),
      z
        .object({
          firmware: z.object({
            file: z.string(),
            sha256: z.string().regex(SHA256_HEX),
          }),
        })
        .loose(),
    ),
    boards: z.array(z.object({ id: z.string(), chip: z.string() }).loose()),
  })
  .loose();

type Asset = z.infer<typeof AssetSchema>;
type Manifest = z.infer<typeof ManifestSchema>;

const newestRelease = (raw: unknown): Asset[] | null => {
  const parsed = z.array(ReleaseSchema).safeParse(raw);
  if (!parsed.success) return null;
  const published = parsed.data.find(
    (release) =>
      !release.draft &&
      release.assets.some((asset) => asset.name === MANIFEST_ASSET),
  );
  return published?.assets ?? null;
};

const assetNamed = (assets: readonly Asset[], name: string): Asset | null =>
  assets.find((asset) => asset.name === name) ?? null;

const buildFor = (
  manifest: Manifest,
  assets: readonly Asset[],
  boardId: string,
): FirmwareRelease | null => {
  const chip = manifest.boards.find((board) => board.id === boardId)?.chip;
  const build = chip === undefined ? undefined : manifest.firmwares[chip];
  if (build === undefined) return null;
  const bin = assetNamed(assets, build.firmware.file);
  const sig = assetNamed(assets, `${build.firmware.file}${SIGNATURE_SUFFIX}`);
  if (bin === null || sig === null) return null;
  return {
    version: manifest.version,
    binName: bin.name,
    binUrl: bin.browser_download_url,
    sigUrl: sig.browser_download_url,
    sizeBytes: bin.size,
    sha256: build.firmware.sha256.toLowerCase(),
  };
};

export const findLatestFirmware = async (
  fetchJson: FetchJson,
  boardId: string,
): Promise<ReleaseLookup> => {
  const assets = newestRelease(await fetchJson(RELEASES_URL));
  const manifestAsset =
    assets === null ? null : assetNamed(assets, MANIFEST_ASSET);
  if (assets === null || manifestAsset === null) return { kind: "unavailable" };
  const manifest = ManifestSchema.safeParse(
    await fetchJson(manifestAsset.browser_download_url),
  );
  if (!manifest.success) return { kind: "unavailable" };
  const release = buildFor(manifest.data, assets, boardId);
  return release === null ? { kind: "noBuild" } : { kind: "found", release };
};
