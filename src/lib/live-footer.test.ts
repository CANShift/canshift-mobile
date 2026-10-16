import { FOOTER_LOOKS, footerState, type FooterInputs } from "./live-footer";

const BASE: FooterInputs = {
  link: "connected",
  noData: false,
  rate: 20,
  secondsSinceData: 0,
};

describe("live footer", () => {
  it("counts updates while data flows", () => {
    expect(footerState(BASE)).toBe("live");
    expect(FOOTER_LOOKS.live.text(BASE)).toBe("Live · 20 updates/s");
  });

  it("says the link is up but silent, with the age of the last update", () => {
    const inputs = { ...BASE, noData: true, secondsSinceData: 6 };
    expect(footerState(inputs)).toBe("noData");
    expect(FOOTER_LOOKS.noData.text(inputs)).toBe(
      "Linked, but no data · last update 6 s ago",
    );
  });

  it("pauses while reconnecting and hides the Display button", () => {
    const inputs = { ...BASE, link: "reconnecting" as const, noData: true };
    expect(footerState(inputs)).toBe("paused");
    expect(FOOTER_LOOKS.paused.showsDisplay).toBe(false);
  });

  it("keeps a demo session live", () => {
    expect(footerState({ ...BASE, link: "demo", noData: true })).toBe("live");
  });
});
