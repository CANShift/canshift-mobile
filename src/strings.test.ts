import { STRINGS } from "./strings";

const leaves = (node: unknown): unknown[] =>
  typeof node === "object" && node !== null
    ? Object.values(node).flatMap(leaves)
    : [node];

const SAMPLE_ARGS = ["Oil pressure", "LOW"];

const rendered = (leaf: unknown): string =>
  typeof leaf === "function"
    ? String((leaf as (...args: unknown[]) => unknown)(...SAMPLE_ARGS))
    : String(leaf);

describe("the copy deck", () => {
  it("counts alerts and laps in the singular and the plural", () => {
    expect(STRINGS.alert.count(1)).toBe("1 alert");
    expect(STRINGS.alert.count(2)).toBe("2 alerts");
    expect(STRINGS.laps.resetConfirm(1)).toBe(
      "Reset the timer? 1 lap will be removed.",
    );
    expect(STRINGS.laps.resetConfirm(5)).toBe(
      "Reset the timer? 5 laps will be removed.",
    );
  });

  it("names the signal in the alert title and the all-clear toast", () => {
    expect(STRINGS.alert.title("Oil pressure", "LOW")).toBe("OIL PRESSURE LOW");
    expect(STRINGS.alert.backToNormal("Oil pressure")).toBe(
      "Oil pressure is back to normal.",
    );
  });

  it("writes a stale age in words", () => {
    expect(STRINGS.stale.secondsAgo(8)).toBe("8 s ago");
  });

  it("leaves no unfilled hole and no empty string", () => {
    const texts = leaves(STRINGS).map(rendered);
    expect(
      texts.filter((text) => text.length === 0 || /[{}]/.test(text)),
    ).toEqual([]);
  });
});
