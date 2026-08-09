import * as React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { STALE_PLACEHOLDER } from "@canshift/core";
import GaugeWidget from "../GaugeWidget";
import LabelWidget from "../LabelWidget";
import GearWidget from "../GearWidget";
import WarningWidget from "../WarningWidget";
import TimerWidget from "../TimerWidget";
import { useTimerStore } from "../../../stores/timer.store";

describe("GaugeWidget", () => {
  it("renders an arc gauge for a sensor-backed signal", async () => {
    const { getByText, toJSON } = await render(
      <GaugeWidget signalKey="r" value={4000} size={140} />,
    );
    expect(getByText("4000")).toBeTruthy();
    expect(toJSON()).toBeTruthy();
  });

  it("renders the stale placeholder when the value is undefined", async () => {
    const { getByText } = await render(
      <GaugeWidget signalKey="ct" value={undefined} size={120} />,
    );
    expect(getByText(STALE_PLACEHOLDER)).toBeTruthy();
  });

  it("falls back to a plain value for signals without a sensor kind", async () => {
    const { getByText, queryByText } = await render(
      <GaugeWidget signalKey="s" value={88} size={120} />,
    );
    expect(getByText("88")).toBeTruthy();
    expect(queryByText(STALE_PLACEHOLDER)).toBeNull();
  });
});

describe("LabelWidget", () => {
  it("renders the label header, value and unit", async () => {
    const { getByText } = await render(
      <LabelWidget signalKey="ct" value={92} width={140} height={88} />,
    );
    expect(getByText("COOLANT")).toBeTruthy();
    expect(getByText("92")).toBeTruthy();
    expect(getByText("°C")).toBeTruthy();
  });

  it("renders the stale placeholder when the value is undefined", async () => {
    const { getByText } = await render(
      <LabelWidget signalKey="op" value={undefined} width={140} height={88} />,
    );
    expect(getByText(STALE_PLACEHOLDER)).toBeTruthy();
  });
});

describe("GearWidget", () => {
  it("renders the gear number for a forward gear", async () => {
    const { getByText } = await render(
      <GearWidget signalKey="g" value={3} size={120} />,
    );
    expect(getByText("3")).toBeTruthy();
  });

  it("renders N for neutral and R for reverse", async () => {
    const neutral = await render(
      <GearWidget signalKey="g" value={0} size={120} />,
    );
    expect(neutral.getByText("N")).toBeTruthy();

    const reverse = await render(
      <GearWidget signalKey="g" value={-1} size={120} />,
    );
    expect(reverse.getByText("R")).toBeTruthy();
  });

  it("renders the neutral glyph when the value is undefined", async () => {
    const { getByText } = await render(
      <GearWidget signalKey="g" value={undefined} size={120} />,
    );
    expect(getByText("N")).toBeTruthy();
  });
});

describe("WarningWidget", () => {
  it("flags an alarm as an alert live region when tripped", async () => {
    const { getByLabelText } = await render(
      <WarningWidget signalKey="ct" value={130} size={48} />,
    );
    const alert = getByLabelText("Coolant warning") as unknown as {
      props: { accessibilityRole?: string; accessibilityLiveRegion?: string };
    };
    expect(alert.props.accessibilityRole).toBe("alert");
    expect(alert.props.accessibilityLiveRegion).toBe("assertive");
  });

  it("renders nothing in the idle state below the danger threshold", async () => {
    const { toJSON } = await render(
      <WarningWidget signalKey="ct" value={80} size={48} />,
    );
    expect(toJSON()).toBeNull();
  });

  it("renders a stale state when the value is undefined", async () => {
    const { getByLabelText } = await render(
      <WarningWidget signalKey="op" value={undefined} size={48} />,
    );
    expect(getByLabelText("Oil Pressure stale")).toBeTruthy();
  });

  it("renders nothing for a signal without a sensor kind", async () => {
    const { toJSON } = await render(
      <WarningWidget signalKey="s" value={100} size={48} />,
    );
    expect(toJSON()).toBeNull();
  });
});

describe("TimerWidget", () => {
  const initialState = useTimerStore.getState();

  beforeEach(() => {
    useTimerStore.setState(initialState, true);
  });

  it("renders the idle stopwatch face and a start action", async () => {
    const { getByLabelText, getByText } = await render(
      <TimerWidget width={132} height={56} />,
    );
    expect(getByLabelText("Start timer")).toBeTruthy();
    expect(getByText("00.000")).toBeTruthy();
  });

  it("toggles into the running state on press", async () => {
    const { getByLabelText, unmount } = await render(
      <TimerWidget width={132} height={56} />,
    );
    await fireEvent.press(getByLabelText("Start timer"));
    expect(useTimerStore.getState().status).toBe("running");
    expect(getByLabelText("Pause timer")).toBeTruthy();
    await unmount();
  });

  it("resets to idle on a long press", async () => {
    const { getByLabelText, unmount } = await render(
      <TimerWidget width={132} height={56} />,
    );
    await fireEvent.press(getByLabelText("Start timer"));
    await fireEvent(getByLabelText("Pause timer"), "longPress");
    expect(useTimerStore.getState().status).toBe("idle");
    await unmount();
  });
});
