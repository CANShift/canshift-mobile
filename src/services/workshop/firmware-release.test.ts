import { RELEASES_URL, findLatestFirmware } from "./firmware-release";

const BASE = "https://github.com/CANShift/canshift-firmware/releases/download";
const SHA = "3ca2428d3d67b95df3f1ef28aba9dd956ee05cbc5a38527442178005e45ac5cc";

const asset = (tag: string, name: string, size = 64) => ({
  name,
  size,
  browser_download_url: `${BASE}/${tag}/${name}`,
});

const release = (tag: string, draft = false) => ({
  tag_name: tag,
  draft,
  prerelease: true,
  assets: [
    asset(tag, `canshift-esp32s3-${tag}-firmware.bin`, 1_632_112),
    asset(tag, `canshift-esp32s3-${tag}-firmware.bin.sig`),
    asset(tag, `canshift-esp32s3-${tag}-merged.bin`, 1_697_648),
    asset(tag, "manifest.json", 1_662),
  ],
});

const manifest = (tag: string) => ({
  schema: 3,
  version: tag.slice(1),
  tag,
  firmwares: {
    esp32s3: {
      merged: { file: `canshift-esp32s3-${tag}-merged.bin`, sha256: SHA },
      firmware: {
        file: `canshift-esp32s3-${tag}-firmware.bin`,
        sha256: SHA.toUpperCase(),
      },
    },
  },
  boards: [
    { id: "crowpanel_28", chip: "esp32" },
    { id: "waveshare_s3_28", chip: "esp32s3" },
  ],
});

const fetchFrom =
  (pages: Record<string, unknown>) =>
  (url: string): Promise<unknown> =>
    url in pages
      ? Promise.resolve(pages[url])
      : Promise.reject(new Error(`404 ${url}`));

describe("findLatestFirmware", () => {
  it("picks the newest published release and the app image for the board's chip", async () => {
    const fetchJson = fetchFrom({
      [RELEASES_URL]: [
        release("v0.21.0", true),
        release("v0.20.2"),
        release("v0.20.1"),
      ],
      [`${BASE}/v0.20.2/manifest.json`]: manifest("v0.20.2"),
    });
    expect(await findLatestFirmware(fetchJson, "waveshare_s3_28")).toEqual({
      kind: "found",
      release: {
        version: "0.20.2",
        binName: "canshift-esp32s3-v0.20.2-firmware.bin",
        binUrl: `${BASE}/v0.20.2/canshift-esp32s3-v0.20.2-firmware.bin`,
        sigUrl: `${BASE}/v0.20.2/canshift-esp32s3-v0.20.2-firmware.bin.sig`,
        sizeBytes: 1_632_112,
        sha256: SHA,
      },
    });
  });

  it("has no build for a board whose chip the release does not ship", async () => {
    const fetchJson = fetchFrom({
      [RELEASES_URL]: [release("v0.20.2")],
      [`${BASE}/v0.20.2/manifest.json`]: manifest("v0.20.2"),
    });
    expect(await findLatestFirmware(fetchJson, "crowpanel_28")).toEqual({
      kind: "noBuild",
    });
    expect(await findLatestFirmware(fetchJson, "unknown_board")).toEqual({
      kind: "noBuild",
    });
  });

  it("is unavailable when the listing or the manifest is not what GitHub serves", async () => {
    expect(
      await findLatestFirmware(
        fetchFrom({ [RELEASES_URL]: { message: "rate limited" } }),
        "waveshare_s3_28",
      ),
    ).toEqual({ kind: "unavailable" });
    const brokenManifest = fetchFrom({
      [RELEASES_URL]: [release("v0.20.2")],
      [`${BASE}/v0.20.2/manifest.json`]: { version: "0.20.2" },
    });
    expect(await findLatestFirmware(brokenManifest, "waveshare_s3_28")).toEqual(
      {
        kind: "unavailable",
      },
    );
  });

  it("lets a network failure reach the caller", async () => {
    await expect(
      findLatestFirmware(fetchFrom({}), "waveshare_s3_28"),
    ).rejects.toThrow("404");
  });
});
