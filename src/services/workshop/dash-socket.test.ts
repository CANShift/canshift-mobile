import { DashSocket } from "./dash-socket";
import { CMD_OTA_WRITE, KEEP_ALIVE_MS, OPEN_TIMEOUT_MS } from "./workshop-wire";
import { fakeDash, type FakeDashOptions } from "../../testing/fake-dash";

const URL = "ws://dash/ws";

const openFake = (options: FakeDashOptions = {}) => {
  const dash = fakeDash(options);
  return { dash, opened: DashSocket.open({ url: URL, connect: dash.connect }) };
};

describe("DashSocket", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("opens after the dash answers the version handshake", async () => {
    const { dash, opened } = openFake({ version: "0.21.0" });
    const result = await opened;
    expect(result.kind).toBe("open");
    expect(result.kind === "open" && result.dash.firmwareVersion).toBe(
      "0.21.0",
    );
    expect(dash.commands).toEqual([{ cmd: 0x10 }]);
    if (result.kind === "open") result.socket.close();
  });

  it("reports busy when the dash closes with 4001", async () => {
    const { opened } = openFake({ busy: true });
    expect((await opened).kind).toBe("busy");
  });

  it("reports unreachable when nothing answers in time", async () => {
    jest.useFakeTimers();
    const { opened } = openFake({ reachable: false });
    jest.advanceTimersByTime(OPEN_TIMEOUT_MS);
    expect((await opened).kind).toBe("unreachable");
  });

  it("reports unreachable when the handshake reply is not a dash", async () => {
    const { opened } = openFake({ reply: () => ({ status: "ok" }) });
    expect((await opened).kind).toBe("unreachable");
  });

  it("matches each status line to the command in flight and skips other frames", async () => {
    const { opened } = openFake({
      reply: (command) =>
        command.cmd === CMD_OTA_WRITE
          ? { status: "error", message: "offset_mismatch", detail: "0x0" }
          : undefined,
    });
    const result = await opened;
    if (result.kind !== "open") throw new Error("expected an open socket");
    const ack = await result.socket.send(CMD_OTA_WRITE, { offset: 4 });
    expect(ack).toEqual({ ok: false, code: "offset_mismatch", detail: "0x0" });
    result.socket.close();
  });

  it("refuses a second command while one is in flight", async () => {
    const { opened } = openFake({
      reply: (command) => (command.cmd === CMD_OTA_WRITE ? null : undefined),
    });
    const result = await opened;
    if (result.kind !== "open") throw new Error("expected an open socket");
    void result.socket.send(CMD_OTA_WRITE);
    expect(await result.socket.send(CMD_OTA_WRITE)).toEqual({
      ok: false,
      code: "link_busy",
    });
    result.socket.close();
  });

  it("fails the command in flight when the dash drops the socket", async () => {
    const { dash, opened } = openFake({
      reply: (command) => (command.cmd === CMD_OTA_WRITE ? null : undefined),
    });
    const result = await opened;
    if (result.kind !== "open") throw new Error("expected an open socket");
    const pending = result.socket.send(CMD_OTA_WRITE);
    dash.drop();
    expect(await pending).toEqual({ ok: false, code: "connection_closed" });
    expect(await result.socket.send(CMD_OTA_WRITE)).toEqual({
      ok: false,
      code: "not_connected",
    });
  });

  it("times out a command the dash never answers", async () => {
    const { opened } = openFake({
      reply: (command) => (command.cmd === CMD_OTA_WRITE ? null : undefined),
    });
    const result = await opened;
    if (result.kind !== "open") throw new Error("expected an open socket");
    jest.useFakeTimers();
    const pending = result.socket.send(CMD_OTA_WRITE, {}, 1_000);
    jest.advanceTimersByTime(1_000);
    expect(await pending).toEqual({ ok: false, code: "ack_timeout" });
    result.socket.close();
  });

  it("sends an empty keep-alive frame while open", async () => {
    jest.useFakeTimers({ doNotFake: ["queueMicrotask", "nextTick"] });
    const { dash, opened } = openFake();
    await Promise.resolve();
    await Promise.resolve();
    const result = await opened;
    if (result.kind !== "open") throw new Error("expected an open socket");
    jest.advanceTimersByTime(KEEP_ALIVE_MS * 2);
    expect(dash.beats()).toBe(2);
    result.socket.close();
    jest.advanceTimersByTime(KEEP_ALIVE_MS * 2);
    expect(dash.beats()).toBe(2);
  });
});
