import * as React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { act, fireEvent, render } from "@testing-library/react-native";
import { AlertTakeover } from "./AlertTakeover";
import { AlertStrip } from "./AlertStrip";
import { publishAlerts, useAlertsStore } from "../../stores/alerts.store";
import { entryFromDash } from "../../lib/alert-model";
import { STRINGS } from "../../strings";

jest.mock("../../services/ble.service", () => ({
  sendCmd: () => Promise.resolve(),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const OIL = entryFromDash({
  source: "oil_pressure",
  signal: "oil_press_bar",
  value: 0.8,
  limit: { value: 1, direction: "below" },
  acknowledged: false,
  displayed: true,
  activeSeconds: 12,
});

const COOLANT = entryFromDash({
  source: "coolant_temp",
  signal: "coolant_temp_c",
  value: 121,
  limit: { value: 118, direction: "above" },
  acknowledged: false,
  displayed: false,
  activeSeconds: 3,
});

const renderAlerts = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <AlertStrip />
      <AlertTakeover />
    </SafeAreaProvider>,
  );

type View = Awaited<ReturnType<typeof renderAlerts>>;

const press = async (element: Parameters<typeof fireEvent.press>[0]) => {
  await act(() => {
    void fireEvent.press(element);
  });
};

const pressFirst = async (view: View, label: string) => {
  const [first] = view.getAllByLabelText(label);
  if (first === undefined) throw new Error(`no ${label}`);
  await press(first);
};

describe("critical alert takeover", () => {
  beforeEach(() => {
    useAlertsStore.setState({
      feed: "dash",
      active: [],
      acknowledged: [],
      muted: [],
    });
  });

  it("shows one alert big, with its limit and context", async () => {
    publishAlerts("dash", [OIL]);
    const view = await renderAlerts();
    expect(view.getByText("OIL PRESSURE LOW")).toBeTruthy();
    expect(view.getByText("Limit: below 1.0 bar")).toBeTruthy();
    expect(view.getByText("0:12")).toBeTruthy();
    expect(view.getByText(STRINGS.alert.fromDash)).toBeTruthy();
  });

  it("shows two alerts at once, newest first, each with its own Acknowledge", async () => {
    publishAlerts("dash", [OIL, COOLANT]);
    const view = await renderAlerts();
    expect(view.getByText("2 alerts")).toBeTruthy();
    const titles = view
      .getAllByText(/(OIL PRESSURE LOW|COOLANT HIGH)/)
      .map((node) => node.props.children as string);
    expect(titles).toEqual(["COOLANT HIGH", "OIL PRESSURE LOW"]);
    expect(view.getAllByLabelText(STRINGS.alert.acknowledge)).toHaveLength(2);
  });

  it("keeps the other alert full screen and strips the acknowledged one", async () => {
    publishAlerts("dash", [OIL, COOLANT]);
    const view = await renderAlerts();
    await pressFirst(view, STRINGS.alert.acknowledge);
    expect(view.getByText("OIL PRESSURE LOW")).toBeTruthy();
    expect(view.getByText("Coolant high · 121 °C")).toBeTruthy();
    expect(view.getByText(STRINGS.alert.stripAcknowledgedActive)).toBeTruthy();
    await press(
      view.getByLabelText(`${STRINGS.alert.show}, Coolant high · 121 °C`),
    );
    expect(view.queryByText(STRINGS.alert.stripAcknowledgedActive)).toBeNull();
  });

  it("mutes every alert on screen for the session, with an Unmute strip", async () => {
    publishAlerts("dash", [OIL, COOLANT]);
    const view = await renderAlerts();
    await press(view.getByLabelText(STRINGS.alert.muteAll));
    expect(view.queryByText("2 alerts")).toBeNull();
    expect(view.getAllByText(STRINGS.alert.stripMutedActive)).toHaveLength(2);
    await press(
      view.getByLabelText(
        `${STRINGS.alert.unmute}, Oil pressure low · 0.8 bar`,
      ),
    );
    expect(view.getByText("OIL PRESSURE LOW")).toBeTruthy();
  });

  it("gives Acknowledge a glove-sized target", async () => {
    publishAlerts("dash", [OIL, COOLANT]);
    const view = await renderAlerts();
    const [ack] = view.getAllByLabelText(STRINGS.alert.acknowledge);
    const style = (ack?.props as { style?: { height?: number }[] }).style ?? [];
    expect(style.some((part) => (part.height ?? 0) >= 88)).toBe(true);
  });
});
