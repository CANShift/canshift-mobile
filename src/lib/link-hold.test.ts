import {
  LINK_HOLD_MS,
  isHoldExpired,
  linkLostLabel,
  linkLostSeconds,
  linkState,
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

describe("copy", () => {
  it("labels the elapsed time in the header", () => {
    expect(linkLostLabel(8)).toBe("LINK LOST 8 s AGO");
  });
});
