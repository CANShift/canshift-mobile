import { blipPlacement } from "./sonar-blips";
import { RADAR_SIZE, SONAR_RINGS } from "./sonar-geometry";

const distanceFromCentre = ({ x, y }: { x: number; y: number }) =>
  Math.hypot(x - RADAR_SIZE / 2, y - RADAR_SIZE / 2);

describe("blipPlacement", () => {
  it.each([
    [-45, "inner"],
    [-60, "inner"],
    [-70, "middle"],
    [-80, "outer"],
    [null, "outer"],
  ] as const)("puts rssi %p on the %s ring", (rssi, ring) => {
    expect(blipPlacement(rssi, "dash-a").ring).toBe(ring);
  });

  it("sits exactly on its ring", () => {
    const placement = blipPlacement(-70, "dash-a");
    expect(distanceFromCentre(placement)).toBeCloseTo(
      RADAR_SIZE / 2 - SONAR_RINGS.middle.inset,
    );
  });

  it("keeps the same angle for the same dash whatever the signal", () => {
    expect(blipPlacement(-45, "dash-a").angleDeg).toBe(
      blipPlacement(-90, "dash-a").angleDeg,
    );
  });

  it("spreads different dashes around the ring", () => {
    const angles = ["CANShift-4F2A", "CANShift-91C0", "CANShift-0001"].map(
      (id) => blipPlacement(-70, id).angleDeg,
    );
    expect(new Set(angles).size).toBe(3);
  });

  it("keeps the angle within one turn, empty id included", () => {
    ["", "a", "AA:BB:CC:DD:EE:FF"].forEach((id) => {
      const { angleDeg } = blipPlacement(-70, id);
      expect(angleDeg).toBeGreaterThanOrEqual(0);
      expect(angleDeg).toBeLessThan(360);
    });
  });
});
