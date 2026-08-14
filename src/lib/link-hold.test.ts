import { STALE_PLACEHOLDER } from "@canshift/core";
import {
  LINK_HOLD_MS,
  LINK_HOLD_POLICY_COPY,
  dashPlaceholder,
  isHoldExpired,
  linkLostLabel,
  linkLostSeconds,
  linkState,
  placeholderForText,
} from "./link-hold";

describe("linkState", () => {
  it("is live while frames arrive", () => {
    expect(linkState(true, 0)).toBe("live");
  });

  it("waits when no frame has ever arrived", () => {
    expect(linkState(false, 0)).toBe("waiting");
  });

  it("is lost once the link went stale", () => {
    expect(linkState(false, 1000)).toBe("lost");
  });
});

describe("linkLostSeconds", () => {
  it("counts whole elapsed seconds since the link dropped", () => {
    expect(linkLostSeconds(10_000, 18_400)).toBe(8);
  });

  it("stays at zero while the link is up", () => {
    expect(linkLostSeconds(0, 18_400)).toBe(0);
  });

  it("never goes negative on a clock that jumped back", () => {
    expect(linkLostSeconds(20_000, 10_000)).toBe(0);
  });
});

describe("isHoldExpired", () => {
  it("holds the last values for the full window", () => {
    expect(isHoldExpired(1000, 1000 + LINK_HOLD_MS - 1)).toBe(false);
  });

  it("expires once the window is reached", () => {
    expect(isHoldExpired(1000, 1000 + LINK_HOLD_MS)).toBe(true);
  });

  it("never expires while the link is up", () => {
    expect(isHoldExpired(0, LINK_HOLD_MS * 10)).toBe(false);
  });
});

describe("dashPlaceholder", () => {
  it("draws one dash per digit", () => {
    expect(dashPlaceholder(2)).toBe("- -");
    expect(dashPlaceholder(4)).toBe("- - - -");
  });

  it("falls back to the shared placeholder without a digit count", () => {
    expect(dashPlaceholder(0)).toBe(STALE_PLACEHOLDER);
  });
});

describe("placeholderForText", () => {
  it("matches the digit count of the held reading", () => {
    expect(placeholderForText("88")).toBe("- -");
    expect(placeholderForText("4000")).toBe("- - - -");
    expect(placeholderForText("13.8")).toBe("- - -");
  });

  it("falls back to the shared placeholder once the values are cleared", () => {
    expect(placeholderForText(undefined)).toBe(STALE_PLACEHOLDER);
  });
});

describe("copy", () => {
  it("states the hold window it enforces", () => {
    expect(LINK_HOLD_POLICY_COPY).toBe(
      "Last values held 30 s, then cleared. Reconnecting automatically.",
    );
  });

  it("labels the elapsed time in the header", () => {
    expect(linkLostLabel(8)).toBe("LINK LOST 8 s AGO");
  });
});
