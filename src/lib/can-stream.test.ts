import { CAN_EMPTY_MESSAGE, canLinkFooter } from "./can-stream";

describe("CAN_EMPTY_MESSAGE", () => {
  it("states the reason the app holds no frames over three lines", () => {
    expect(CAN_EMPTY_MESSAGE).toBe(
      "NO FRAMES YET.\nTHE DASH SENDS TELEMETRY,\nNOT THE RAW BUS.",
    );
    expect(CAN_EMPTY_MESSAGE.split("\n")).toHaveLength(3);
  });
});

describe("canLinkFooter", () => {
  it("names demo mode whatever the link reports", () => {
    expect(canLinkFooter("sim", "connected")).toBe("Link: demo mode");
  });

  it("states a live Bluetooth link", () => {
    expect(canLinkFooter("ble", "connected")).toBe("Link: connected");
  });

  it("states the link is offline before any device is picked", () => {
    expect(canLinkFooter("idle", "idle")).toBe("Link: offline");
  });

  it("states the attempt while the link comes up", () => {
    expect(canLinkFooter("ble", "connecting")).toBe("Link: connecting");
  });

  it("states a failed link", () => {
    expect(canLinkFooter("ble", "error")).toBe("Link: failed");
  });
});
