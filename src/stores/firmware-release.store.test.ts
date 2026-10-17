import { createHash } from "node:crypto";
import {
  createFirmwareReleaseStore,
  type FirmwareReleaseDeps,
} from "./firmware-release.store";
import { RELEASES_URL } from "../services/workshop/firmware-release";
import { buildAppImage } from "../testing/app-image";

const IMAGE = buildAppImage("0.21.0", 2_048);
const SHA = createHash("sha256").update(IMAGE).digest("hex");
const BIN = "canshift-esp32s3-v0.21.0-firmware.bin";

const LISTING = [
  {
    draft: false,
    assets: [
      {
        name: BIN,
        size: IMAGE.byteLength,
        browser_download_url: "https://dl/bin",
      },
      { name: `${BIN}.sig`, size: 64, browser_download_url: "https://dl/sig" },
      {
        name: "manifest.json",
        size: 900,
        browser_download_url: "https://dl/manifest",
      },
    ],
  },
];

const MANIFEST = {
  version: "0.21.0",
  firmwares: { esp32s3: { firmware: { file: BIN, sha256: SHA } } },
  boards: [{ id: "waveshare_s3_28", chip: "esp32s3" }],
};

const deps = (
  overrides: Partial<FirmwareReleaseDeps> = {},
): FirmwareReleaseDeps => ({
  fetchJson: (url) =>
    Promise.resolve(url === RELEASES_URL ? LISTING : MANIFEST),
  fetchFile: (url) =>
    Promise.resolve(url === "https://dl/bin" ? IMAGE : new Uint8Array(64)),
  sha256Hex: (bytes) =>
    Promise.resolve(createHash("sha256").update(bytes).digest("hex")),
  discardCache: jest.fn(),
  ...overrides,
});

describe("the firmware release card", () => {
  it("does not look for an update on a dash without workshop mode", async () => {
    const fetchJson = jest.fn();
    const store = createFirmwareReleaseStore(deps({ fetchJson }));
    await store.getState().check("crowpanel_28", "0.20.2");
    expect(store.getState().card).toEqual({ kind: "unsupported" });
    expect(fetchJson).not.toHaveBeenCalled();
  });

  it("offers a newer release and says when the dash is up to date", async () => {
    const store = createFirmwareReleaseStore(deps());
    await store.getState().check("waveshare_s3_28", "0.20.2");
    expect(store.getState().card.kind).toBe("available");
    await store.getState().check("waveshare_s3_28", "0.21.0");
    expect(store.getState().card.kind).toBe("upToDate");
  });

  it("is unavailable when GitHub cannot be reached", async () => {
    const store = createFirmwareReleaseStore(
      deps({
        fetchJson: () =>
          Promise.reject(new TypeError("Network request failed")),
      }),
    );
    await store.getState().check("waveshare_s3_28", "0.20.2");
    expect(store.getState().card).toEqual({ kind: "unavailable" });
  });

  it("downloads and checks the files before offering the install", async () => {
    const store = createFirmwareReleaseStore(deps());
    await store.getState().check("waveshare_s3_28", "0.20.2");
    await store.getState().download();
    const { card } = store.getState();
    expect(card.kind).toBe("ready");
    expect(card.kind === "ready" && card.pkg.version).toBe("0.21.0");
  });

  it("keeps the release on screen when the download fails, so it can be retried", async () => {
    const store = createFirmwareReleaseStore(
      deps({
        fetchFile: () =>
          Promise.reject(new TypeError("Network request failed")),
      }),
    );
    await store.getState().check("waveshare_s3_28", "0.20.2");
    await store.getState().download();
    expect(store.getState().card).toMatchObject({
      kind: "downloadFailed",
      problem: "offline",
    });
  });
});
