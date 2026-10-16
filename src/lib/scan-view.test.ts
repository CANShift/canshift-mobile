import { scanView, type ScanViewInputs } from "./scan-view";
import { SIGNAL_BARS, signalStrength } from "./signal-strength";

const BASE: ScanViewInputs = {
  promptSeen: true,
  denied: false,
  reconnecting: false,
  scanning: false,
  deviceCount: 0,
};

describe("scan view", () => {
  it("asks first on the first run", () => {
    expect(scanView({ ...BASE, promptSeen: false })).toBe("permission");
  });

  it("puts a refused permission ahead of everything", () => {
    expect(scanView({ ...BASE, denied: true, promptSeen: false })).toBe(
      "denied",
    );
  });

  it("shows the reconnect state before a new search", () => {
    expect(scanView({ ...BASE, reconnecting: true, scanning: true })).toBe(
      "reconnecting",
    );
  });

  it("keeps the radar until the first dash shows up, then lists it", () => {
    expect(scanView({ ...BASE, scanning: true })).toBe("scanning");
    expect(scanView({ ...BASE, scanning: true, deviceCount: 1 })).toBe("found");
  });

  it("falls back to the empty state", () => {
    expect(scanView(BASE)).toBe("empty");
  });
});

describe("signal strength", () => {
  it("grades RSSI into strong, OK and weak", () => {
    expect(signalStrength(-50)).toBe("strong");
    expect(signalStrength(-70)).toBe("ok");
    expect(signalStrength(-90)).toBe("weak");
    expect(signalStrength(null)).toBe("weak");
    expect(SIGNAL_BARS.strong).toBe(4);
  });
});
