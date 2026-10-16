import { useState } from "react";
import { useDeviceStore } from "../stores/device.store";
import { log } from "../stores/log.store";
import { sendCmd } from "../services/ble.service";
import { reportDashFailure } from "../lib/report-dash-failure";

export interface SentCommand {
  id: string;
  command: string;
  atMs: number;
}

export interface SendConsole {
  canSend: boolean;
  ready: boolean;
  command: string;
  setCommand: (command: string) => void;
  history: readonly SentCommand[];
  submit: () => Promise<void>;
}

const sendOnce = async (command: string): Promise<boolean> => {
  try {
    await sendCmd(command);
    log("info", `Console sent "${command}"`);
    return true;
  } catch (err) {
    reportDashFailure(`Console command "${command}"`, err);
    return false;
  }
};

export const useSendConsole = (): SendConsole => {
  const canSend = useDeviceStore(
    (s) => s.mode === "ble" && s.connectionState === "connected",
  );
  const [command, setCommand] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<readonly SentCommand[]>([]);
  const trimmed = command.trim();
  const submit = async (): Promise<void> => {
    if (trimmed.length === 0 || sending) return;
    setSending(true);
    const sent = await sendOnce(trimmed);
    setSending(false);
    if (!sent) return;
    const atMs = Date.now();
    setHistory((current) => [
      { id: `${String(atMs)}-${trimmed}`, command: trimmed, atMs },
      ...current,
    ]);
    setCommand("");
  };
  return {
    canSend,
    ready: trimmed.length > 0 && !sending,
    command,
    setCommand,
    history,
    submit,
  };
};
