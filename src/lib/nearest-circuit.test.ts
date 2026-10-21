import {
  CIRCUIT_MATCH_RADIUS_M,
  metersBetween,
  nearestCircuit,
} from "./nearest-circuit";
import type { SavedCircuit } from "../services/circuit-storage";

const METERS_PER_DEG_LAT = 111_320;

const circuitAt = (id: string, lat: number, lng: number): SavedCircuit => ({
  id,
  name: id,
  line: { a: { lat, lng: lng - 0.0002 }, b: { lat, lng: lng + 0.0002 } },
  forwardBearingDeg: 0,
  savedAt: 0,
});

const north = (meters: number): number => meters / METERS_PER_DEG_LAT;

describe("metersBetween", () => {
  it("measures a north offset in meters", () => {
    expect(
      metersBetween({ lat: 46, lng: 7 }, { lat: 46 + north(500), lng: 7 }),
    ).toBeCloseTo(500, 0);
  });

  it("shrinks longitude degrees away from the equator", () => {
    const atEquator = metersBetween({ lat: 0, lng: 0 }, { lat: 0, lng: 0.01 });
    const atSixty = metersBetween({ lat: 60, lng: 0 }, { lat: 60, lng: 0.01 });
    expect(atSixty).toBeCloseTo(atEquator / 2, 0);
  });
});

describe("nearestCircuit", () => {
  const home = circuitAt("home", 46, 7);
  const far = circuitAt("far", 47, 8);

  it("has nothing to offer without a position", () => {
    expect(nearestCircuit([home], undefined)).toBeNull();
  });

  it("offers the circuit whose line is within range", () => {
    const position = { lat: 46 + north(CIRCUIT_MATCH_RADIUS_M - 100), lng: 7 };
    expect(nearestCircuit([far, home], position)).toBe(home);
  });

  it("ignores circuits beyond the match radius", () => {
    const position = { lat: 46 + north(CIRCUIT_MATCH_RADIUS_M + 100), lng: 7 };
    expect(nearestCircuit([home, far], position)).toBeNull();
  });

  it("prefers the closest of two circuits in range", () => {
    const near = circuitAt("near", 46 + north(300), 7);
    expect(nearestCircuit([home, near], { lat: 46 + north(250), lng: 7 })).toBe(
      near,
    );
  });
});
