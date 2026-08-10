import { tryParseJson } from "./try-parse-json";

describe("tryParseJson", () => {
  it("returns the parsed value on valid JSON", () => {
    expect(tryParseJson('{"a":1}')).toEqual({ ok: true, value: { a: 1 } });
  });

  it("reports failure instead of throwing or returning undefined", () => {
    expect(tryParseJson("{oops")).toEqual({ ok: false });
  });

  it("treats a bare literal as a successful parse", () => {
    expect(tryParseJson("null")).toEqual({ ok: true, value: null });
  });
});
