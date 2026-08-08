import { buildGraphCsv } from "./graph-export";
import type { TelemetrySample } from "../stores/telemetry.store";

describe("buildGraphCsv", () => {
  it("emits a header of t_ms plus the requested signals", () => {
    const csv = buildGraphCsv([], ["r", "lam"]);
    expect(csv).toBe("t_ms,r,lam");
  });

  it("writes one row per sample in signal order", () => {
    const samples: TelemetrySample[] = [
      { t: 1000, v: { r: 3500, lam: 0.98 } },
      { t: 1100, v: { r: 3600, lam: 0.99 } },
    ];
    expect(buildGraphCsv(samples, ["r", "lam"])).toBe(
      "t_ms,r,lam\n1000,3500,0.98\n1100,3600,0.99",
    );
  });

  it("leaves a cell empty when a signal is absent from a sample", () => {
    const samples: TelemetrySample[] = [{ t: 500, v: { r: 4000 } }];
    expect(buildGraphCsv(samples, ["r", "lam"])).toBe("t_ms,r,lam\n500,4000,");
  });
});
