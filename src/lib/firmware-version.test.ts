import { isNewerThan, sameVersion } from "./firmware-version";

describe("firmware versions", () => {
  it.each([
    ["0.21.0", "0.20.2", true],
    ["0.20.10", "0.20.9", true],
    ["1.0.0", "0.99.99", true],
    ["0.20.2", "0.20.2", false],
    ["0.20.1", "0.20.2", false],
    ["0.20.2", "v0.20.1-dirty", true],
    ["0.20.2", "?", true],
    ["nightly", "0.20.2", false],
  ])("%s is newer than %s: %s", (candidate, running, newer) => {
    expect(isNewerThan(candidate, running)).toBe(newer);
  });

  it("treats a tag and a build suffix as the same release", () => {
    expect(sameVersion("v0.21.0", "0.21.0-dirty")).toBe(true);
    expect(sameVersion("0.21.0", "0.20.2")).toBe(false);
    expect(sameVersion("0.21.0", "?")).toBe(false);
  });
});
