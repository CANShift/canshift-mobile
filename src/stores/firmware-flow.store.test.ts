import { createFirmwareFlowStore } from "./firmware-flow.store";
import { DashSocket } from "../services/workshop/dash-socket";
import {
  CMD_OTA_BEGIN,
  CMD_OTA_END,
  CMD_OTA_WRITE,
  CMD_REBOOT,
} from "../services/workshop/workshop-wire";
import {
  fakeDash,
  type FakeDash,
  type FakeDashOptions,
} from "../testing/fake-dash";
import { buildAppImage } from "../testing/app-image";
import type {
  FirmwareFlowDeps,
  FlowView,
} from "../services/workshop/firmware-flow-types";

const BOARD = "waveshare_s3_28";
const NETWORK = { ssid: "CANShift-k7m2", password: "abcdefgh2345" };
const PKG = {
  bytes: buildAppImage("0.21.0", 20_000),
  signature: new Uint8Array(64),
  sha256: "cd".repeat(32),
  version: "0.21.0",
};

const setup = (
  dashes: FakeDashOptions[] = [{}],
  returnsWith: string | null = "0.21.0",
) => {
  const opened: FakeDash[] = [];
  let clock = 0;
  const deps: FirmwareFlowDeps = {
    openSocket: () => {
      const dash = fakeDash(dashes[Math.min(opened.length, dashes.length - 1)]);
      opened.push(dash);
      return DashSocket.open({ url: "ws://dash/ws", connect: dash.connect });
    },
    wifi: {
      canJoin: true,
      join: jest.fn(() => Promise.resolve("joined" as const)),
      forget: jest.fn(),
    },
    ble: {
      hold: jest.fn(),
      resume: jest.fn(() => Promise.resolve()),
      waitForDash: jest.fn(() => Promise.resolve(returnsWith)),
    },
    network: {
      load: () => Promise.resolve(NETWORK),
      save: jest.fn(() => Promise.resolve()),
    },
    sleep: () => Promise.resolve(),
    now: () => (clock += 1_000),
  };
  const store = createFirmwareFlowStore(deps);
  const views: FlowView["kind"][] = [];
  store.subscribe((state) => {
    if (views.at(-1) !== state.view.kind) views.push(state.view.kind);
  });
  return { store, deps, opened, views };
};

const toReady = async ({ store }: ReturnType<typeof setup>) => {
  await store.getState().open(PKG, "0.20.2", BOARD);
  store.getState().inWorkshop();
  await store.getState().join();
};

const cmds = (dash: FakeDash | undefined) =>
  dash?.commands.map((command) => command.cmd) ?? [];

describe("the firmware update flow", () => {
  it("holds Bluetooth, joins the dash Wi-Fi and waits for the install", async () => {
    const flow = setup();
    await toReady(flow);
    expect(flow.deps.ble.hold).toHaveBeenCalledTimes(1);
    expect(flow.deps.wifi.join).toHaveBeenCalledWith(
      NETWORK.ssid,
      NETWORK.password,
    );
    expect(flow.deps.network.save).toHaveBeenCalledWith(NETWORK);
    expect(flow.store.getState().view).toEqual({ kind: "ready" });
    expect(flow.views).toEqual(["prepare", "wifi", "connecting", "ready"]);
  });

  it("refuses a dash on the Wi-Fi that is not the one linked over Bluetooth", async () => {
    const flow = setup([{ version: "0.19.0" }]);
    await toReady(flow);
    expect(flow.store.getState().view).toEqual({
      kind: "failed",
      failure: { kind: "differentDash" },
    });
    await flow.store.getState().install();
    expect(cmds(flow.opened[0])).toEqual([0x10]);
  });

  it("leaves the wrong dash alone on close", async () => {
    const flow = setup([{ version: "0.19.0" }]);
    await toReady(flow);
    await flow.store.getState().close();
    expect(flow.opened).toHaveLength(1);
    expect(cmds(flow.opened[0])).toEqual([0x10]);
    expect(flow.deps.ble.resume).toHaveBeenCalledTimes(1);
  });

  it("takes the right dash out of workshop mode after a retry finds it", async () => {
    const flow = setup([{ version: "0.19.0" }, {}]);
    await toReady(flow);
    await flow.store.getState().retry();
    expect(flow.store.getState().view).toEqual({ kind: "ready" });
    await flow.store.getState().close();
    expect(cmds(flow.opened[1]).at(-1)).toBe(CMD_REBOOT);
  });

  it("refuses a dash of another board", async () => {
    const flow = setup();
    await flow.store.getState().open(PKG, "0.20.2", "crowpanel_43");
    flow.store.getState().inWorkshop();
    await flow.store.getState().join();
    expect(flow.store.getState().view).toEqual({
      kind: "failed",
      failure: { kind: "differentDash" },
    });
  });

  it("installs, takes the dash out of workshop mode and confirms the version over Bluetooth", async () => {
    const flow = setup([{}, { version: "0.21.0" }]);
    await toReady(flow);
    await flow.store.getState().install();
    expect(flow.store.getState().view).toEqual({
      kind: "success",
      version: "0.21.0",
    });
    expect(flow.views.slice(-2)).toEqual(["running", "success"]);
    expect(cmds(flow.opened[0])).toEqual([
      0x10,
      CMD_OTA_BEGIN,
      CMD_OTA_WRITE,
      CMD_OTA_WRITE,
      CMD_OTA_WRITE,
      CMD_OTA_END,
    ]);
    expect(cmds(flow.opened[1])).toEqual([0x10, CMD_REBOOT]);
    expect(flow.deps.wifi.forget).toHaveBeenCalledWith(NETWORK.ssid);
    expect(flow.deps.ble.resume).toHaveBeenCalledTimes(1);
  });

  it("says the dash went back when Bluetooth reports the old version", async () => {
    const flow = setup([{}], "0.20.2");
    await toReady(flow);
    await flow.store.getState().install();
    expect(flow.store.getState().view).toEqual({
      kind: "failed",
      failure: { kind: "rolledBack", running: "0.20.2" },
    });
  });

  it("says the dash has not come back when Bluetooth never reconnects", async () => {
    const flow = setup([{}, { busy: true }], null);
    await toReady(flow);
    await flow.store.getState().install();
    expect(flow.store.getState().view).toEqual({
      kind: "failed",
      failure: { kind: "notBack" },
    });
  });

  it("keeps the socket after a refusal so Try again goes straight back to the install", async () => {
    const flow = setup([
      {
        reply: (command) =>
          command.cmd === CMD_OTA_BEGIN
            ? { status: "error", message: "ota_begin_failed" }
            : undefined,
      },
    ]);
    await toReady(flow);
    await flow.store.getState().install();
    expect(flow.store.getState().view).toEqual({
      kind: "failed",
      failure: { kind: "refused", code: "ota_begin_failed", detail: null },
    });
    await flow.store.getState().retry();
    expect(flow.store.getState().view).toEqual({ kind: "ready" });
    expect(flow.opened).toHaveLength(1);
  });

  it("calls a dropped upload a drop, with nothing installed", async () => {
    const flow = setup();
    await toReady(flow);
    const dash = flow.opened[0];
    const install = flow.store.getState().install();
    dash?.drop();
    await install;
    expect(flow.store.getState().view).toEqual({
      kind: "failed",
      failure: { kind: "dropped" },
    });
    expect(flow.deps.ble.resume).not.toHaveBeenCalled();
  });

  it("goes back to the confirmation when the upload is cancelled", async () => {
    const flow = setup();
    await toReady(flow);
    flow.store.getState().cancelUpload();
    const install = flow.store.getState().install();
    flow.store.getState().cancelUpload();
    await install;
    expect(flow.store.getState().view).toEqual({ kind: "ready" });
    expect(cmds(flow.opened[0]).at(-1)).toBe(CMD_OTA_END);
    expect(flow.opened[0]?.commands.at(-1)).toEqual({
      cmd: CMD_OTA_END,
      action: "abort",
    });
  });

  it("tells a busy dash apart from an unreachable one", async () => {
    const busy = setup([{ busy: true }]);
    await toReady(busy);
    expect(busy.store.getState().view).toEqual({ kind: "busy" });
    const away = setup([{ reachable: false }]);
    jest.useFakeTimers({ doNotFake: ["nextTick", "queueMicrotask"] });
    const reaching = toReady(away);
    for (let attempt = 0; attempt < 4; attempt++) {
      await jest.advanceTimersByTimeAsync(8_000);
    }
    await reaching;
    jest.useRealTimers();
    expect(away.store.getState().view).toEqual({ kind: "unreachable" });
    expect(away.opened).toHaveLength(4);
  });

  it("shows why the phone did not join and stays on the Wi-Fi step", async () => {
    const flow = setup();
    (flow.deps.wifi.join as jest.Mock).mockResolvedValueOnce("invalid");
    await toReady(flow);
    expect(flow.store.getState().view).toEqual({
      kind: "wifi",
      joining: false,
      problem: "invalid",
    });
    expect(flow.opened).toHaveLength(0);
  });

  it("takes the dash out of workshop mode and gives Bluetooth back on close", async () => {
    const flow = setup();
    await toReady(flow);
    await flow.store.getState().close();
    expect(flow.store.getState().view).toEqual({ kind: "closed" });
    expect(cmds(flow.opened[0]).at(-1)).toBe(CMD_REBOOT);
    expect(flow.deps.wifi.forget).toHaveBeenCalledWith(NETWORK.ssid);
    expect(flow.deps.ble.resume).toHaveBeenCalledTimes(1);
  });

  it("only gives Bluetooth back when closed before the dash entered workshop mode", async () => {
    const flow = setup();
    await flow.store.getState().open(PKG, "0.20.2", BOARD);
    await flow.store.getState().close();
    expect(flow.opened).toHaveLength(0);
    expect(flow.deps.wifi.forget).not.toHaveBeenCalled();
    expect(flow.deps.ble.resume).toHaveBeenCalledTimes(1);
  });

  it("stays closed when cancelled while the socket is still opening", async () => {
    const flow = setup();
    const realOpen = flow.deps.openSocket;
    let release: () => void = () => undefined;
    flow.deps.openSocket = () =>
      new Promise((resolve) => {
        release = () => {
          void realOpen().then(resolve);
        };
      });
    await flow.store.getState().open(PKG, "0.20.2", BOARD);
    flow.store.getState().inWorkshop();
    const joining = flow.store.getState().join();
    await Promise.resolve();
    flow.deps.openSocket = realOpen;
    await flow.store.getState().close();
    release();
    await joining;
    expect(flow.store.getState().view).toEqual({ kind: "closed" });
    const late = flow.opened[0];
    expect(cmds(late).at(-1)).toBe(CMD_REBOOT);
    expect(late?.isOpen()).toBe(false);
  });

  it("forgets the dash Wi-Fi when cancelled while the phone is joining it", async () => {
    const flow = setup();
    let finishJoin: (outcome: "joined") => void = () => undefined;
    (flow.deps.wifi.join as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishJoin = resolve;
        }),
    );
    await flow.store.getState().open(PKG, "0.20.2", BOARD);
    const joining = flow.store.getState().join();
    await flow.store.getState().close();
    finishJoin("joined");
    await joining;
    expect(flow.store.getState().view).toEqual({ kind: "closed" });
    expect(flow.deps.wifi.forget).toHaveBeenCalledWith(NETWORK.ssid);
    expect(flow.opened).toHaveLength(0);
  });

  it("closes the socket of an upload that timed out, so Try again is not refused as busy", async () => {
    const flow = setup([
      {
        reply: (command) => (command.cmd === CMD_OTA_WRITE ? null : undefined),
      },
      {},
    ]);
    await toReady(flow);
    jest.useFakeTimers({ doNotFake: ["nextTick", "queueMicrotask"] });
    const install = flow.store.getState().install();
    await jest.advanceTimersByTimeAsync(8_000);
    await install;
    jest.useRealTimers();
    expect(flow.store.getState().view).toEqual({
      kind: "failed",
      failure: { kind: "dropped" },
    });
    expect(flow.opened[0]?.isOpen()).toBe(false);
    await flow.store.getState().retry();
    expect(flow.store.getState().view).toEqual({ kind: "ready" });
  });
});
