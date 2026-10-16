import { sensorDefaultDangerBand } from "@canshift/core";
import {
  LIVE_PAGES,
  TILES,
  TILES_PER_PAGE,
  type LiveTileSpec,
} from "./live-tiles";
import { NO_VALUE, tileModel, tileState } from "./tile-state";
import { SIGNAL_STALE_MS } from "./signal-staleness";

const NOW = 1_000_000;

const tile = (signal: string): LiveTileSpec => {
  const spec = Object.values(TILES).find(
    (candidate) => candidate.signal === signal,
  );
  if (spec === undefined) throw new Error(`no tile for ${signal}`);
  return spec;
};

const OIL_T_DANGER = sensorDefaultDangerBand("oil_temp").above ?? 0;

describe("tile state", () => {
  it("says No data for a signal that never arrived", () => {
    const model = tileModel(tile("fp"), {
      value: undefined,
      lastAt: undefined,
      paused: false,
      nowMs: NOW,
    });
    expect(model.state).toBe("nodata");
    expect(model.text).toBe(NO_VALUE);
    expect(model.tag).toBe("No data");
    expect(model.accessibilityLabel).toBe("Fuel pressure, no data");
  });

  it("goes stale with its age once the signal stops for the threshold", () => {
    const model = tileModel(tile("ct"), {
      value: 92,
      lastAt: NOW - SIGNAL_STALE_MS - 6_000,
      paused: false,
      nowMs: NOW,
    });
    expect(model.state).toBe("stale");
    expect(model.tag).toBe("8 s ago");
    expect(model.accessibilityLabel).toBe(
      "Water temp, 92 degrees, 8 seconds ago",
    );
  });

  it("goes stale while the link is paused, even with a recent value", () => {
    expect(
      tileState("r", { value: 3000, lastAt: NOW, paused: true, nowMs: NOW }),
    ).toBe("stale");
  });

  it("reads danger in words for VoiceOver", () => {
    const model = tileModel(tile("ot"), {
      value: OIL_T_DANGER + 5,
      lastAt: NOW,
      paused: false,
      nowMs: NOW,
    });
    expect(model.state).toBe("danger");
    expect(model.tag).toBe("Danger");
    expect(model.accessibilityLabel).toBe(
      `Oil temp, ${String(OIL_T_DANGER + 5)} degrees, danger`,
    );
  });

  it("stays normal and quiet inside the band", () => {
    const model = tileModel(tile("op"), {
      value: 3.8,
      lastAt: NOW,
      paused: false,
      nowMs: NOW,
    });
    expect(model.state).toBe("normal");
    expect(model.tag).toBe("");
    expect(model.accessibilityLabel).toBe("Oil pressure, 3.8 bar");
  });

  it("writes the gear as the dash does", () => {
    const model = tileModel(TILES.gear, {
      value: 0,
      lastAt: NOW,
      paused: false,
      nowMs: NOW,
    });
    expect(model.text).toBe("N");
    expect(model.accessibilityLabel).toBe("Gear, N");
  });

  it("keeps every dash page and fits each one in the grid", () => {
    expect(LIVE_PAGES.map((page) => page.name)).toEqual([
      "Overview",
      "Street",
      "Track",
      "Engine",
      "Tuning",
    ]);
    for (const page of LIVE_PAGES) {
      expect(page.tiles.length).toBeLessThanOrEqual(TILES_PER_PAGE);
    }
  });
});
