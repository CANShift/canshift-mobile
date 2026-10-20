import * as React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import PagesScreen from "./PagesScreen";
import { PAGES_STRINGS } from "../pages-strings";
import { useDeviceStore } from "../stores/device.store";
import { useDashPagesStore } from "../stores/dash-pages.store";
import { Toast } from "../components/ui/toast";

const mockSendCmd = jest.fn((_cmd: string, _payload?: object) =>
  Promise.resolve(),
);
const mockRefresh = jest.fn(() => Promise.resolve());

jest.mock("../services/ble.service", () => ({
  sendCmd: (cmd: string, payload?: object) => mockSendCmd(cmd, payload),
  refreshDashPages: () => mockRefresh(),
}));

const PAGES = ["street", "track", "engine"];

const renderPages = () =>
  render(<PagesScreen backLabel="Device" onBack={jest.fn()} />);

type View = Awaited<ReturnType<typeof renderPages>>;

const press = async (view: View, label: string) => {
  await act(() => {
    void fireEvent.press(view.getByLabelText(label));
  });
};

const dashAnswers = (listState: "unsupported" | "failed") => {
  useDeviceStore.setState({ mode: "ble", connectionState: "connected" });
  useDashPagesStore.getState().setListState(listState);
  mockRefresh.mockImplementation(() => {
    useDashPagesStore.getState().setListState(listState);
    return Promise.resolve();
  });
};

const linkDash = (onScreenId: string) => {
  useDeviceStore.setState({ mode: "ble", connectionState: "connected" });
  useDashPagesStore.getState().setPages(PAGES);
  useDashPagesStore.getState().setOnScreen(onScreenId);
};

const initialDevice = useDeviceStore.getState();

describe("Pages", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useDeviceStore.setState(initialDevice, true);
    useDashPagesStore.getState().reset();
    mockSendCmd.mockClear();
    mockRefresh.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("lists the dash pages and marks the one on screen", async () => {
    linkDash("track");
    const view = await renderPages();
    expect(view.getByText("Street")).toBeTruthy();
    expect(
      view.getByLabelText(`Track, ${PAGES_STRINGS.onScreen}`),
    ).toBeTruthy();
    expect(view.getByLabelText(PAGES_STRINGS.alreadyOnScreen)).toBeDisabled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("shows the selected page on the dash and follows the dash's confirmation", async () => {
    linkDash("street");
    const view = await renderPages();
    await press(view, "Engine");
    await press(view, PAGES_STRINGS.showOnDash("Engine"));
    expect(mockSendCmd).toHaveBeenCalledWith("show_page", { page: "engine" });
    expect(view.getByLabelText(PAGES_STRINGS.switching)).toBeDisabled();
    await act(() => {
      useDashPagesStore.getState().setOnScreen("engine");
    });
    expect(
      view.getByLabelText(`Engine, ${PAGES_STRINGS.onScreen}`),
    ).toBeTruthy();
    expect(view.getByLabelText(PAGES_STRINGS.alreadyOnScreen)).toBeTruthy();
  });
});

describe("Pages failures", () => {
  const showToast = jest.spyOn(Toast, "show").mockImplementation(jest.fn());

  beforeEach(() => {
    jest.useFakeTimers();
    useDeviceStore.setState(initialDevice, true);
    useDashPagesStore.getState().reset();
    showToast.mockClear();
    mockSendCmd.mockClear();
    mockRefresh.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("says so when the dash never switches", async () => {
    linkDash("street");
    const view = await renderPages();
    await press(view, "Track");
    await press(view, PAGES_STRINGS.showOnDash("Track"));
    await act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(showToast).toHaveBeenCalledWith({
      type: "error",
      text1: PAGES_STRINGS.notSwitched("Track"),
    });
    expect(
      view.getByLabelText(PAGES_STRINGS.showOnDash("Track")),
    ).toBeEnabled();
  });

  it("reports a write the dash never received", async () => {
    linkDash("street");
    mockSendCmd.mockRejectedValueOnce(new Error("write failed"));
    const view = await renderPages();
    await press(view, "Track");
    await press(view, PAGES_STRINGS.showOnDash("Track"));
    expect(showToast).toHaveBeenCalledWith({
      type: "error",
      text1: PAGES_STRINGS.sendFailed,
    });
    expect(
      view.getByLabelText(PAGES_STRINGS.showOnDash("Track")),
    ).toBeEnabled();
  });

  it("asks for a firmware update when the dash doesn't share its pages", async () => {
    dashAnswers("unsupported");
    const view = await renderPages();
    expect(view.getByText(PAGES_STRINGS.unsupportedTitle)).toBeTruthy();
  });

  it("re-reads the pages on Try again after a failed read", async () => {
    dashAnswers("failed");
    const view = await renderPages();
    mockRefresh.mockClear();
    await press(view, PAGES_STRINGS.retry);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
