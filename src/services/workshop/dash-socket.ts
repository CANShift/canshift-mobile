import { parseUntrustedJsonObject, parseUsbStatus } from "@canshift/core/wire";
import type { UsbStatus } from "@canshift/core/wire";
import {
  ACK_TIMEOUT_MS,
  CLOSE_BUSY,
  CMD_QUERY_VERSION,
  KEEP_ALIVE_MS,
  OPEN_TIMEOUT_MS,
  type Ack,
} from "./workshop-wire";
import type { SocketConnector, SocketTransport } from "./socket-transport";

export type OpenResult =
  | { kind: "open"; socket: DashSocket; dash: UsbStatus }
  | { kind: "busy" }
  | { kind: "unreachable" };

export interface DashSocketOptions {
  url: string;
  connect: SocketConnector;
  openTimeoutMs?: number;
  keepAliveMs?: number;
}

interface PendingAck {
  resolve: (ack: Ack) => void;
  timer: ReturnType<typeof setTimeout>;
}

interface StatusFrame {
  line: string;
  fields: Record<string, unknown>;
}

const statusFrameOf = (line: string): StatusFrame | null => {
  const parsed = parseUntrustedJsonObject(line);
  if (parsed.kind !== "ok" || !("status" in parsed.value)) return null;
  return { line, fields: parsed.value };
};

const ackOf = ({ line, fields: reply }: StatusFrame): Ack => {
  if (reply.status === "ok") return { ok: true, reply, line };
  const code =
    typeof reply.message === "string" ? reply.message : "device_error";
  return typeof reply.detail === "string"
    ? { ok: false, code, detail: reply.detail }
    : { ok: false, code };
};

const dashOf = (ack: Ack): UsbStatus | null => {
  if (!ack.ok) return null;
  const parsed = parseUsbStatus(ack.line);
  return parsed.kind === "ok" ? parsed.status : null;
};

export class DashSocket {
  private transport: SocketTransport | null = null;
  private pending: PendingAck | null = null;
  private keepAlive: ReturnType<typeof setInterval> | null = null;
  private closedBy: number | null = null;

  private constructor(private readonly options: DashSocketOptions) {}

  static open = (options: DashSocketOptions): Promise<OpenResult> =>
    new DashSocket(options).start();

  send = (
    cmd: number,
    fields: Record<string, unknown> = {},
    timeoutMs = ACK_TIMEOUT_MS,
  ): Promise<Ack> => {
    const transport = this.transport;
    if (!transport?.isOpen()) {
      return Promise.resolve({ ok: false, code: "not_connected" });
    }
    if (this.pending !== null) {
      return Promise.resolve({ ok: false, code: "link_busy" });
    }
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.settle({ ok: false, code: "ack_timeout" });
      }, timeoutMs);
      this.pending = { resolve, timer };
      transport.send(JSON.stringify({ cmd, ...fields }));
    });
  };

  close = (): void => {
    this.stopKeepAlive();
    this.transport?.close();
    this.transport = null;
    this.settle({ ok: false, code: "not_connected" });
  };

  private start(): Promise<OpenResult> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.close();
        resolve({ kind: "unreachable" });
      }, this.options.openTimeoutMs ?? OPEN_TIMEOUT_MS);
      this.transport = this.options.connect(this.options.url, {
        opened: () => {
          clearTimeout(timeout);
          void this.handshake().then(resolve);
        },
        message: this.receive,
        closed: (code) => {
          clearTimeout(timeout);
          this.dropped(code);
          resolve(this.refusal());
        },
      });
    });
  }

  private async handshake(): Promise<OpenResult> {
    this.startKeepAlive();
    const ack = await this.send(CMD_QUERY_VERSION);
    const dash = dashOf(ack);
    if (dash !== null) return { kind: "open", socket: this, dash };
    this.close();
    return this.refusal();
  }

  private refusal(): OpenResult {
    return this.closedBy === CLOSE_BUSY
      ? { kind: "busy" }
      : { kind: "unreachable" };
  }

  private readonly receive = (data: string): void => {
    for (const line of data.split("\n")) {
      const frame = statusFrameOf(line);
      if (frame !== null) this.settle(ackOf(frame));
    }
  };

  private dropped(code: number): void {
    this.closedBy = code;
    this.stopKeepAlive();
    this.transport = null;
    this.settle({
      ok: false,
      code: code === CLOSE_BUSY ? "busy" : "connection_closed",
    });
  }

  private settle(ack: Ack): void {
    const pending = this.pending;
    if (pending === null) return;
    this.pending = null;
    clearTimeout(pending.timer);
    pending.resolve(ack);
  }

  private startKeepAlive(): void {
    this.keepAlive = setInterval(() => {
      if (this.transport?.isOpen() === true) this.transport.send("");
    }, this.options.keepAliveMs ?? KEEP_ALIVE_MS);
  }

  private stopKeepAlive(): void {
    if (this.keepAlive !== null) clearInterval(this.keepAlive);
    this.keepAlive = null;
  }
}
