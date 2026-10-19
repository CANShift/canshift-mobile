import { Buffer } from "buffer";
import { encodeAlertFrame } from "@canshift/core/wire";
import { sensorDefaultDangerBand } from "@canshift/core/widget-metrics";
import {
  fallBackToLocalAlerts,
  handleAlertFrame,
  startLocalAlertFeed,
} from "./alert-feeds";
import { useAlertsStore } from "../stores/alerts.store";
import { useSignalsStore } from "../stores/signals.store";

const OP_LIMIT = sensorDefaultDangerBand("oil_press").below ?? 0;

const frame = (bytes: Uint8Array | null): string => {
  if (bytes === null) throw new Error("unencodable frame");
  return Buffer.from(bytes).toString("base64");
};

const DASH_OIL = {
  source: "oil_pressure" as const,
  configuredIndex: null,
  signal: "oil_press_bar",
  value: 0.8,
  limit: { value: 1, direction: "below" as const },
  acknowledged: false,
  displayed: true,
  activeSeconds: 12,
};

const initialSignals = useSignalsStore.getState();

describe("alert feeds", () => {
  let stop: () => void = () => undefined;

  beforeEach(() => {
    useSignalsStore.setState(initialSignals, true);
    useAlertsStore.setState({
      feed: "local",
      active: [],
      acknowledged: [],
      muted: [],
    });
    stop = startLocalAlertFeed();
  });

  afterEach(() => {
    stop();
  });

  it("raises an alert from the phone's own reading when the dash sends no alert frame", () => {
    useSignalsStore.getState().update({ op: OP_LIMIT - 0.5 });
    const [alert] = useAlertsStore.getState().active;
    expect(alert?.key).toBe("oil_pressure");
    expect(alert?.limit).toEqual({ value: OP_LIMIT, direction: "below" });
  });

  it("clears the local alert once the reading recovers", () => {
    useSignalsStore.getState().update({ op: OP_LIMIT - 0.5 });
    useSignalsStore.getState().update({ op: OP_LIMIT + 2 });
    expect(useAlertsStore.getState().active).toEqual([]);
  });

  it("mirrors the dash once its alert frame arrives and stops deciding locally", () => {
    handleAlertFrame(frame(encodeAlertFrame([DASH_OIL])));
    expect(useAlertsStore.getState().feed).toBe("dash");
    expect(useAlertsStore.getState().active[0]).toMatchObject({
      key: "oil_pressure",
      value: 0.8,
      activeSeconds: 12,
    });
    useSignalsStore.getState().update({ op: OP_LIMIT + 2 });
    expect(useAlertsStore.getState().active).toHaveLength(1);
  });

  it("clears the takeover when the dash sends an empty frame", () => {
    handleAlertFrame(frame(encodeAlertFrame([DASH_OIL])));
    handleAlertFrame(frame(encodeAlertFrame([])));
    expect(useAlertsStore.getState().active).toEqual([]);
  });

  it("keeps every configured entry the dash lists apart", () => {
    const configured = (configuredIndex: number, value: number) => ({
      ...DASH_OIL,
      source: "configured" as const,
      configuredIndex,
      value,
      displayed: false,
    });
    handleAlertFrame(
      frame(encodeAlertFrame([configured(0, 0.8), configured(3, 9.1)])),
    );
    expect(useAlertsStore.getState().active.map((alert) => alert.key)).toEqual([
      "configured:0",
      "configured:3",
    ]);
  });

  it("keeps deciding on the phone when the dash speaks the single-alert frame", () => {
    handleAlertFrame(Buffer.from([1, 0]).toString("base64"));
    useSignalsStore.getState().update({ op: OP_LIMIT - 0.5 });
    expect(useAlertsStore.getState().feed).toBe("local");
    expect(useAlertsStore.getState().active).toHaveLength(1);
  });

  it("ignores a malformed frame", () => {
    handleAlertFrame(Buffer.from([9, 9]).toString("base64"));
    expect(useAlertsStore.getState().feed).toBe("local");
  });

  it("goes back to the phone's decision when the dash link drops", () => {
    handleAlertFrame(frame(encodeAlertFrame([DASH_OIL])));
    fallBackToLocalAlerts();
    expect(useAlertsStore.getState()).toMatchObject({
      feed: "local",
      active: [],
    });
  });
});
