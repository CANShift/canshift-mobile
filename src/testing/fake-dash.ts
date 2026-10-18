import {
  CLOSE_BUSY,
  CMD_QUERY_VERSION,
} from "../services/workshop/workshop-wire";
import type {
  SocketConnector,
  SocketHandlers,
} from "../services/workshop/socket-transport";

type FakeReply = Record<string, unknown> | null;

export interface FakeDashOptions {
  version?: string;
  reachable?: boolean;
  busy?: boolean;
  reply?: (command: Record<string, unknown>) => FakeReply | undefined;
}

export interface FakeDash {
  connect: SocketConnector;
  commands: Record<string, unknown>[];
  beats: () => number;
  isOpen: () => boolean;
  drop: (code?: number) => void;
}

interface FakeLink {
  handlers: SocketHandlers | null;
  open: boolean;
  beats: number;
  commands: Record<string, unknown>[];
}

const ABNORMAL_CLOSE = 1006;

const versionReply = (version: string): Record<string, unknown> => ({
  status: "ok",
  version,
  protocol: 1,
  is_day: 0,
  board_id: "waveshare_s3_28",
});

const defaultReply = (
  options: FakeDashOptions,
  command: Record<string, unknown>,
): FakeReply =>
  command.cmd === CMD_QUERY_VERSION
    ? versionReply(options.version ?? "0.20.2")
    : { status: "ok" };

const answer = (
  link: FakeLink,
  options: FakeDashOptions,
  command: Record<string, unknown>,
): void => {
  const custom = options.reply?.(command);
  const reply = custom === undefined ? defaultReply(options, command) : custom;
  if (reply === null) return;
  void Promise.resolve().then(() =>
    link.handlers?.message(JSON.stringify(reply)),
  );
};

const receive = (link: FakeLink, options: FakeDashOptions, data: string) => {
  if (data === "") {
    link.beats += 1;
    return;
  }
  const command = JSON.parse(data) as Record<string, unknown>;
  link.commands.push(command);
  answer(link, options, command);
};

const dropLink = (link: FakeLink, code = ABNORMAL_CLOSE): void => {
  link.open = false;
  link.handlers?.closed(code);
};

const accept = (link: FakeLink, options: FakeDashOptions): void => {
  if (options.reachable === false) return;
  link.open = true;
  link.handlers?.opened();
  if (options.busy === true) dropLink(link, CLOSE_BUSY);
};

const connectorFor =
  (link: FakeLink, options: FakeDashOptions): SocketConnector =>
  (_url, handlers) => {
    link.handlers = handlers;
    void Promise.resolve().then(() => {
      accept(link, options);
    });
    return {
      send: (data) => {
        receive(link, options, data);
      },
      close: () => {
        link.open = false;
      },
      isOpen: () => link.open,
    };
  };

export const fakeDash = (options: FakeDashOptions = {}): FakeDash => {
  const link: FakeLink = {
    handlers: null,
    open: false,
    beats: 0,
    commands: [],
  };
  const connect = connectorFor(link, options);
  return {
    connect,
    commands: link.commands,
    beats: () => link.beats,
    isOpen: () => link.open,
    drop: (code) => {
      dropLink(link, code);
    },
  };
};
