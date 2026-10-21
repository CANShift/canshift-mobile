import { setLineHere } from "./track-mode-actions";
import {
  clearAll,
  pushSample,
  useTrackSessionStore,
} from "../stores/track-session.store";
import { useCircuitsStore } from "../stores/circuits.store";
import { STRINGS } from "../strings";
import { startGpsSubscription } from "../services/gps-subscription";

const mockToast = jest.fn();

jest.mock("../services/track-mode-controller", () => ({
  trackModeController: {},
}));

jest.mock("../components/ui/toast", () => ({
  Toast: {
    show: (params: unknown) => {
      mockToast(params);
    },
  },
}));

const pushAt = (headingDeg: number): void => {
  pushSample({ t: 1, lat: 47.0786, lng: 7.0611, speedMs: 0, headingDeg });
};

describe("setLineHere", () => {
  beforeEach(() => {
    clearAll();
    useCircuitsStore.setState({ armed: null });
    mockToast.mockClear();
  });

  it("refuses a stopped fix whose course is unknown", () => {
    pushAt(-1);
    expect(setLineHere()).toBe(false);
    expect(useTrackSessionStore.getState().startFinishSet).toBe(false);
    expect(useCircuitsStore.getState().armed).toBeNull();
    expect(mockToast).toHaveBeenCalledWith({
      type: "error",
      text1: STRINGS.laps.setLineMoving,
    });
  });

  it("refuses a fix that carries no heading at all", async () => {
    await startGpsSubscription({
      start: (onUpdate) => {
        onUpdate({
          t: 1,
          lat: 47.0786,
          lng: 7.0611,
          speedMs: null,
          headingDeg: null,
          accuracyM: 4,
        });
        return Promise.resolve(() => undefined);
      },
    });
    expect(setLineHere()).toBe(false);
    expect(useCircuitsStore.getState().armed).toBeNull();
  });

  it("arms the line along the rolling course", () => {
    pushAt(90);
    expect(setLineHere()).toBe(true);
    expect(useTrackSessionStore.getState().startFinishSet).toBe(true);
    expect(useCircuitsStore.getState().armed?.forwardBearingDeg).toBe(90);
    expect(mockToast).not.toHaveBeenCalled();
  });
});
