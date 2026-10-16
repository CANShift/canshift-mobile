import * as React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import ConsoleScreen from "./ConsoleScreen";
import { log, useLogStore } from "../stores/log.store";
import { useDeviceStore } from "../stores/device.store";
import { STRINGS } from "../strings";

const mockSendCmd = jest.fn((_cmd: string) => Promise.resolve());

jest.mock("../services/ble.service", () => ({
  sendCmd: (cmd: string) => mockSendCmd(cmd),
}));

const renderConsole = () => render(<ConsoleScreen onBack={jest.fn()} />);

type View = Awaited<ReturnType<typeof renderConsole>>;

const press = async (view: View, label: string) => {
  await act(() => {
    void fireEvent.press(view.getByLabelText(label));
  });
};

const initialDevice = useDeviceStore.getState();

describe("Console", () => {
  beforeEach(() => {
    useLogStore.getState().clear();
    useDeviceStore.setState(initialDevice, true);
    mockSendCmd.mockClear();
  });

  it("filters the log by level", async () => {
    log("info", "link up");
    log("error", "write failed");
    const view = await renderConsole();
    expect(view.getByText("link up")).toBeTruthy();
    await press(view, STRINGS.console.filterErrors);
    expect(view.queryByText("link up")).toBeNull();
    expect(view.getByText("write failed")).toBeTruthy();
  });

  it("filters the log by text", async () => {
    log("info", "link up");
    log("warn", "slow frame");
    const view = await renderConsole();
    await act(() => {
      void fireEvent.changeText(
        view.getByLabelText(STRINGS.console.filter),
        "slow",
      );
    });
    expect(view.queryByText("link up")).toBeNull();
    expect(view.getByText("slow frame")).toBeTruthy();
  });

  it("sends a command and keeps it in the history", async () => {
    useDeviceStore.setState({ mode: "ble", connectionState: "connected" });
    const view = await renderConsole();
    await press(view, STRINGS.console.send);
    expect(view.getByText(STRINGS.console.sendHint)).toBeTruthy();
    await act(() => {
      void fireEvent.changeText(
        view.getByLabelText(STRINGS.console.command),
        "reset_odo",
      );
    });
    const sendButtons = view.getAllByLabelText(STRINGS.console.send);
    const sendButton = sendButtons[sendButtons.length - 1];
    if (sendButton === undefined) throw new Error("no send button");
    await act(async () => {
      void fireEvent.press(sendButton);
      await Promise.resolve();
    });
    expect(mockSendCmd).toHaveBeenCalledWith("reset_odo");
    expect(view.getByText("> reset_odo")).toBeTruthy();
  });

  it("explains that send needs a Bluetooth dash", async () => {
    const view = await renderConsole();
    await press(view, STRINGS.console.send);
    expect(view.getByText(STRINGS.console.sendUnavailable)).toBeTruthy();
  });

  it("explains why the CAN view is empty", async () => {
    const view = await renderConsole();
    await press(view, STRINGS.console.can);
    expect(view.getByText(STRINGS.console.canEmptyTitle)).toBeTruthy();
  });
});
