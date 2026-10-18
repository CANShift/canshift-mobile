import { TELEMETRY_KEEPALIVE_MS } from "@canshift/core";
import {
  SIGNAL_STALE_MS,
  ageSeconds,
  freshValues,
  isSignalFresh,
} from "./signal-staleness";

const NOW = 100_000;

describe("signal staleness", () => {
  it("keeps a signal fresh up to the threshold and stale past it", () => {
    expect(isSignalFresh(NOW - SIGNAL_STALE_MS, NOW)).toBe(true);
    expect(isSignalFresh(NOW - SIGNAL_STALE_MS - 1, NOW)).toBe(false);
  });

  it("never calls a signal that never arrived fresh", () => {
    expect(isSignalFresh(undefined, NOW)).toBe(false);
  });

  it("waits two and a half dash keepalives before calling a signal stale", () => {
    expect(SIGNAL_STALE_MS).toBe(TELEMETRY_KEEPALIVE_MS * 2.5);
  });

  it("counts whole seconds since a stamp and never goes negative", () => {
    expect(ageSeconds(NOW - 6_400, NOW)).toBe(6);
    expect(ageSeconds(NOW + 500, NOW)).toBe(0);
  });

  it("keeps only the values refreshed within the threshold", () => {
    expect(
      freshValues(
        { op: 0.8, ot: 112, r: 3000 },
        { op: NOW - 100, ot: NOW - 5_000 },
        NOW,
      ),
    ).toEqual({ op: 0.8 });
  });
});
