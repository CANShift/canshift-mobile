import { setLineHere } from "./track-mode-actions";
import {
  clearAll,
  pushSample,
  useTrackSessionStore,
} from "../stores/track-session.store";
import { useCircuitsStore } from "../stores/circuits.store";
import { STRINGS } from "../strings";

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

  it("arms the line along the rolling course", () => {
    pushAt(90);
    expect(setLineHere()).toBe(true);
    expect(useTrackSessionStore.getState().startFinishSet).toBe(true);
    expect(useCircuitsStore.getState().armed?.forwardBearingDeg).toBe(90);
    expect(mockToast).not.toHaveBeenCalled();
  });
});
