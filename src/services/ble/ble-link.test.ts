import { DeviceLink } from "./ble-link";
import { GattQueue } from "./ble-gatt-queue";
import { useSignalsStore } from "../../stores/signals.store";
import { SIGNAL_STALE_MS } from "../../lib/signal-staleness";

const CHECK_SLACK_MS = 300;

const newLink = (): DeviceLink =>
  new DeviceLink(new GattQueue(), {
    onLinkLost: jest.fn(),
    onDisconnected: jest.fn(),
    showToast: jest.fn(),
  });

const initialSignals = useSignalsStore.getState();

describe("DeviceLink staleness", () => {
  let link: DeviceLink;

  beforeEach(() => {
    jest.useFakeTimers();
    useSignalsStore.setState(initialSignals, true);
    link = newLink();
  });

  afterEach(() => {
    link.stopStalenessTimer();
    jest.useRealTimers();
  });

  it("keeps a stream live while frames keep coming", () => {
    link.startStalenessTimer();
    for (let i = 0; i < 6; i++) {
      useSignalsStore.getState().update({ r: 3000 });
      jest.advanceTimersByTime(SIGNAL_STALE_MS / 2);
    }
    expect(useSignalsStore.getState().isLive).toBe(true);
  });

  it("marks the stream stale once nothing arrives for the threshold", () => {
    useSignalsStore.getState().update({ r: 3000 });
    link.startStalenessTimer();
    jest.advanceTimersByTime(SIGNAL_STALE_MS + CHECK_SLACK_MS);
    expect(useSignalsStore.getState().isLive).toBe(false);
    expect(useSignalsStore.getState().staleSinceMs).toBeGreaterThan(0);
  });

  it("does not flap at a one-second keepalive", () => {
    useSignalsStore.getState().update({ r: 3000 });
    link.startStalenessTimer();
    jest.advanceTimersByTime(1_000);
    useSignalsStore.getState().update({ r: 3000 });
    jest.advanceTimersByTime(1_000);
    expect(useSignalsStore.getState().staleSinceMs).toBe(0);
  });

  it("flags a dash that never sends anything after the link comes up", () => {
    link.startStalenessTimer();
    jest.advanceTimersByTime(SIGNAL_STALE_MS + CHECK_SLACK_MS);
    expect(useSignalsStore.getState().staleSinceMs).toBeGreaterThan(0);
  });
});
