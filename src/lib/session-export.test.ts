import { buildGpx, buildLapsCsv, exportFileName } from "./session-export";

describe("buildLapsCsv", () => {
  it("writes a header and one row per lap with the delta to the best", () => {
    expect(
      buildLapsCsv([
        { number: 1, ms: 95_120 },
        { number: 2, ms: 92_450 },
      ]),
    ).toBe(
      "lap,lap_ms,lap_time,delta_to_best_ms\n1,95120,1:35.12,2670\n2,92450,1:32.45,0",
    );
  });

  it("writes only the header when no lap was timed", () => {
    expect(buildLapsCsv([])).toBe("lap,lap_ms,lap_time,delta_to_best_ms");
  });
});

describe("buildGpx", () => {
  it("writes one timed track point per trace point", () => {
    const gpx = buildGpx("Dijon", [
      { t: Date.UTC(2026, 9, 21, 10, 0, 0), lat: 47.36, lng: 4.9, speedMs: 30 },
    ]);
    expect(gpx).toContain('<gpx version="1.1" creator="CANShift"');
    expect(gpx).toContain("<name>Dijon</name>");
    expect(gpx).toContain(
      '<trkpt lat="47.36" lon="4.9"><time>2026-10-21T10:00:00.000Z</time></trkpt>',
    );
  });

  it("escapes the session name", () => {
    expect(buildGpx(`A&B <"x">`, [])).toContain(
      "<name>A&amp;B &lt;&quot;x&quot;&gt;</name>",
    );
  });
});

describe("exportFileName", () => {
  it("names the file after the session start", () => {
    expect(exportFileName(Date.UTC(2026, 9, 21, 14, 32), "gpx")).toBe(
      "canshift-session-2026-10-21-14-32.gpx",
    );
  });
});
