import * as React from "react";
import { render } from "@testing-library/react-native";
import { useSignalsStore } from "../../../stores/signals.store";
import { useDeviceStore } from "../../../stores/device.store";
import { LINK_HOLD_POLICY_COPY } from "../../../lib/link-hold";
import DashTopBar from "../../DashTopBar";
import { DashLinkFooter } from "../DashLinkFooter";
import { GridLabel } from "../GridLabel";

const signalsInitialState = useSignalsStore.getState();
const deviceInitialState = useDeviceStore.getState();

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(100_000);
  useSignalsStore.setState(signalsInitialState, true);
  useDeviceStore.setState(deviceInitialState, true);
});

afterEach(() => {
  jest.useRealTimers();
});

const dropTheLink = (): void => {
  useSignalsStore.getState().update({ r: 4000, s: 88 });
  jest.setSystemTime(108_000);
  useSignalsStore.setState({ isLive: false, staleSinceMs: 100_000 });
};

describe("DashTopBar", () => {
  it("states how long the link has been lost under the screen title", async () => {
    dropTheLink();
    const { getByText } = await render(<DashTopBar title="Dashboard" />);
    expect(getByText("Dashboard")).toBeTruthy();
    expect(getByText("LINK LOST 8 s AGO")).toBeTruthy();
  });

  it("says nothing about the link while frames arrive", async () => {
    useSignalsStore.getState().update({ r: 4000 });
    const { queryByText } = await render(<DashTopBar title="Dashboard" />);
    expect(queryByText("LINK LOST 0 s AGO")).toBeNull();
    expect(queryByText("NO DATA")).toBeNull();
  });

  it("carries nothing but the title and the note", async () => {
    useDeviceStore.setState({ deviceName: "CANSHIFT-8F21" });
    useSignalsStore.getState().update({ r: 4000, mi: 2 });
    const { queryByText } = await render(<DashTopBar title="Dashboard" />);
    expect(queryByText("CANSHIFT-8F21")).toBeNull();
    expect(queryByText("MAP 2")).toBeNull();
    expect(queryByText("CAN")).toBeNull();
  });
});

describe("DashLinkFooter", () => {
  it("states the hold policy while the link is lost", async () => {
    dropTheLink();
    const { getByText } = await render(<DashLinkFooter />);
    expect(getByText(LINK_HOLD_POLICY_COPY)).toBeTruthy();
  });

  it("renders nothing while the link is up", async () => {
    useSignalsStore.getState().update({ r: 4000 });
    const { toJSON } = await render(<DashLinkFooter />);
    expect(toJSON()).toBeNull();
  });
});

describe("GridLabel", () => {
  it("dashes the held reading digit for digit", async () => {
    dropTheLink();
    const rpm = await render(
      <GridLabel signalKey="r" width={140} height={88} dayMode={false} />,
    );
    expect(rpm.getByText("- - - -")).toBeTruthy();

    const speed = await render(
      <GridLabel signalKey="s" width={140} height={88} dayMode={false} />,
    );
    expect(speed.getByText("- -")).toBeTruthy();
  });

  it("falls back to the shared placeholder once the hold is over", async () => {
    dropTheLink();
    useSignalsStore.getState().clearHeld();
    const { getByText } = await render(
      <GridLabel signalKey="r" width={140} height={88} dayMode={false} />,
    );
    expect(getByText("- -")).toBeTruthy();
  });
});
