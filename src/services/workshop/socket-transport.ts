export interface SocketHandlers {
  opened: () => void;
  message: (data: string) => void;
  closed: (code: number) => void;
}

export interface SocketTransport {
  send: (data: string) => void;
  close: () => void;
  isOpen: () => boolean;
}

export type SocketConnector = (
  url: string,
  handlers: SocketHandlers,
) => SocketTransport;

const ABNORMAL_CLOSE = 1006;

export const connectWebSocket: SocketConnector = (url, handlers) => {
  const socket = new WebSocket(url);
  socket.onopen = () => {
    handlers.opened();
  };
  socket.onmessage = (event: { data: unknown }) => {
    if (typeof event.data === "string") handlers.message(event.data);
  };
  socket.onclose = (event: { code?: number }) => {
    handlers.closed(event.code ?? ABNORMAL_CLOSE);
  };
  return {
    send: (data) => {
      socket.send(data);
    },
    close: () => {
      socket.close();
    },
    isOpen: () => socket.readyState === WebSocket.OPEN,
  };
};
