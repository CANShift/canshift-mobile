import { errText } from "./error-text";

describe("errText", () => {
  it("takes the message off an Error", () => {
    expect(errText(new Error("write failed"))).toBe("write failed");
  });

  it("passes a thrown string through", () => {
    expect(errText("ENOSPC")).toBe("ENOSPC");
  });

  it("falls back rather than rendering [object Object]", () => {
    expect(errText({ code: 28 })).toBe("unknown error");
    expect(errText(null)).toBe("unknown error");
  });

  it("falls back on an Error with an empty message", () => {
    expect(errText(new Error(""), "save failed")).toBe("save failed");
  });
});
