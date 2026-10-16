import { deriveLink, isLinkedToData, keepsScreenAwake } from "./link-model";

describe("deriveLink", () => {
  it("names a simulated session demo whatever the transport says", () => {
    expect(
      deriveLink({
        connectionState: "connected",
        mode: "sim",
        isReconnecting: true,
      }),
    ).toBe("demo");
  });

  it("puts a reconnect ahead of the connection state", () => {
    expect(
      deriveLink({
        connectionState: "error",
        mode: "ble",
        isReconnecting: true,
      }),
    ).toBe("reconnecting");
  });

  it.each([
    ["idle", "offline"],
    ["scanning", "scanning"],
    ["connecting", "connecting"],
    ["connected", "connected"],
    ["error", "offline"],
  ] as const)("maps %s to %s", (connectionState, link) => {
    expect(
      deriveLink({ connectionState, mode: "ble", isReconnecting: false }),
    ).toBe(link);
  });
});

describe("link helpers", () => {
  it("keeps the screen awake while a dash is linked or being reconnected", () => {
    expect(keepsScreenAwake("connected")).toBe(true);
    expect(keepsScreenAwake("reconnecting")).toBe(true);
    expect(keepsScreenAwake("demo")).toBe(true);
    expect(keepsScreenAwake("offline")).toBe(false);
    expect(keepsScreenAwake("scanning")).toBe(false);
  });

  it("expects data only from a connected or simulated dash", () => {
    expect(isLinkedToData("connected")).toBe(true);
    expect(isLinkedToData("demo")).toBe(true);
    expect(isLinkedToData("reconnecting")).toBe(false);
  });
});
