import { installFirmware, OTA_CHUNK_BYTES, type OtaLink } from "./ota-install";
import {
  CMD_OTA_BEGIN,
  CMD_OTA_END,
  CMD_OTA_WRITE,
  type Ack,
} from "./workshop-wire";
import { buildAppImage } from "../../testing/app-image";

interface Sent {
  cmd: number;
  fields: Record<string, unknown>;
}

const fakeLink = (
  answer: (sent: Sent) => Ack = () => ({ ok: true, reply: {}, line: "" }),
) => {
  const sent: Sent[] = [];
  const link: OtaLink = {
    send: (cmd, fields = {}) => {
      const entry = { cmd, fields };
      sent.push(entry);
      return Promise.resolve(answer(entry));
    },
  };
  return { link, sent };
};

const pkg = () => ({
  bytes: buildAppImage("0.21.0", OTA_CHUNK_BYTES * 2 + 100),
  signature: new Uint8Array(64).fill(7),
  sha256: "ab".repeat(32),
  version: "0.21.0",
});

const hooks = () => ({
  onProgress: jest.fn(),
  onCommitting: jest.fn(),
  isCancelled: () => false,
});

const refuse = (code: string, detail?: string): Ack =>
  detail === undefined ? { ok: false, code } : { ok: false, code, detail };

describe("installFirmware", () => {
  it("opens the slot, streams every chunk in order and commits", async () => {
    const { link, sent } = fakeLink();
    const progress = hooks();
    const firmware = pkg();
    expect(await installFirmware(link, firmware, progress)).toEqual({
      kind: "installed",
    });
    expect(sent[0]).toEqual({
      cmd: CMD_OTA_BEGIN,
      fields: {
        total: firmware.bytes.byteLength,
        sha256: firmware.sha256,
        sig: Buffer.from(firmware.signature).toString("base64"),
        version: "0.21.0",
      },
    });
    const writes = sent.filter((entry) => entry.cmd === CMD_OTA_WRITE);
    expect(writes.map((entry) => entry.fields.offset)).toEqual([
      0,
      OTA_CHUNK_BYTES,
      OTA_CHUNK_BYTES * 2,
    ]);
    const rebuilt = Buffer.concat(
      writes.map((entry) => Buffer.from(String(entry.fields.data), "base64")),
    );
    expect(rebuilt.equals(Buffer.from(firmware.bytes))).toBe(true);
    expect(sent.at(-1)).toEqual({
      cmd: CMD_OTA_END,
      fields: { action: "commit" },
    });
    expect(progress.onProgress).toHaveBeenLastCalledWith(
      firmware.bytes.byteLength,
      firmware.bytes.byteLength,
    );
    expect(progress.onCommitting).toHaveBeenCalledTimes(1);
  });

  it("stops before writing when the dash refuses to begin", async () => {
    const { link, sent } = fakeLink((entry) =>
      entry.cmd === CMD_OTA_BEGIN
        ? refuse("ota_unsigned")
        : { ok: true, reply: {}, line: "" },
    );
    expect(await installFirmware(link, pkg(), hooks())).toEqual({
      kind: "refused",
      code: "ota_unsigned",
      detail: null,
    });
    expect(sent).toHaveLength(1);
  });

  it("aborts the slot when a chunk is refused", async () => {
    const { link, sent } = fakeLink((entry) =>
      entry.cmd === CMD_OTA_WRITE && entry.fields.offset === OTA_CHUNK_BYTES
        ? refuse("ota_write_failed", "0x1503")
        : { ok: true, reply: {}, line: "" },
    );
    expect(await installFirmware(link, pkg(), hooks())).toEqual({
      kind: "refused",
      code: "ota_write_failed",
      detail: "0x1503",
    });
    expect(sent.at(-1)).toEqual({
      cmd: CMD_OTA_END,
      fields: { action: "abort" },
    });
  });

  it("calls a lost link during the upload a drop", async () => {
    const { link } = fakeLink((entry) =>
      entry.cmd === CMD_OTA_WRITE
        ? refuse("connection_closed")
        : { ok: true, reply: {}, line: "" },
    );
    expect(await installFirmware(link, pkg(), hooks())).toEqual({
      kind: "dropped",
    });
  });

  it("cannot tell the outcome when the commit reply never comes", async () => {
    const { link } = fakeLink((entry) =>
      entry.cmd === CMD_OTA_END
        ? refuse("ack_timeout")
        : { ok: true, reply: {}, line: "" },
    );
    expect(await installFirmware(link, pkg(), hooks())).toEqual({
      kind: "unconfirmed",
    });
  });

  it("reports a refused commit with its code", async () => {
    const { link } = fakeLink((entry) =>
      entry.cmd === CMD_OTA_END
        ? refuse("ota_bad_signature")
        : { ok: true, reply: {}, line: "" },
    );
    expect(await installFirmware(link, pkg(), hooks())).toEqual({
      kind: "refused",
      code: "ota_bad_signature",
      detail: null,
    });
  });

  it("aborts without committing when the upload is cancelled", async () => {
    const { link, sent } = fakeLink();
    let calls = 0;
    const cancelling = { ...hooks(), isCancelled: () => ++calls > 1 };
    expect(await installFirmware(link, pkg(), cancelling)).toEqual({
      kind: "cancelled",
    });
    expect(sent.filter((entry) => entry.cmd === CMD_OTA_WRITE)).toHaveLength(1);
    expect(sent.at(-1)).toEqual({
      cmd: CMD_OTA_END,
      fields: { action: "abort" },
    });
  });
});
