import { create } from "zustand";
import type { BleConnectionError } from "../services/ble.errors";

export type ConnectionState =
  "idle" | "scanning" | "connecting" | "connected" | "error";

export type DeviceMode = "idle" | "sim" | "ble";

interface DeviceState {
  connectionState: ConnectionState;
  mode: DeviceMode;
  deviceId: string | null;
  deviceName: string | null;
  lastDashName: string | null;
  firmwareVersion: string | null;
  boardId: string | null;
  canHealthy: boolean;
  error: BleConnectionError | null;
  linkProblem: BleConnectionError | null;
  unreadableFramesInARow: number;

  setConnectionState: (s: ConnectionState) => void;
  setMode: (m: DeviceMode) => void;
  setDevice: (id: string, name: string) => void;
  setFirmwareStatus: (version: string, canHealthy: boolean) => void;
  setBoardId: (boardId: string) => void;
  setError: (err: BleConnectionError | null) => void;
  setLinkProblem: (problem: BleConnectionError) => void;
  countUnreadableFrame: () => void;
  markTelemetryReadable: () => void;
  clearError: () => void;
  disconnect: () => void;
}

export const useDeviceStore = create<DeviceState>()((set) => ({
  connectionState: "idle",
  mode: "idle",
  deviceId: null,
  deviceName: null,
  lastDashName: null,
  firmwareVersion: null,
  boardId: null,
  canHealthy: false,
  error: null,
  linkProblem: null,
  unreadableFramesInARow: 0,

  setConnectionState: (connectionState) => {
    set({ connectionState });
  },

  setMode: (mode) => {
    set({ mode });
  },

  setDevice: (deviceId, deviceName) => {
    set({
      deviceId,
      deviceName,
      lastDashName: deviceName,
      connectionState: "connected",
      error: null,
    });
  },

  setFirmwareStatus: (firmwareVersion, canHealthy) => {
    set({ firmwareVersion, canHealthy });
  },

  setBoardId: (boardId) => {
    set({ boardId });
  },

  setError: (error) => {
    set({ error, connectionState: "error" });
  },

  setLinkProblem: (linkProblem) => {
    set({ linkProblem });
  },

  countUnreadableFrame: () => {
    set((s) => ({ unreadableFramesInARow: s.unreadableFramesInARow + 1 }));
  },

  markTelemetryReadable: () => {
    set((s) => ({
      unreadableFramesInARow: 0,
      linkProblem:
        s.linkProblem?.kind === "telemetry-malformed" ? null : s.linkProblem,
    }));
  },

  clearError: () => {
    set({ error: null, connectionState: "idle" });
  },

  disconnect: () => {
    set({
      connectionState: "idle",
      mode: "idle",
      deviceId: null,
      deviceName: null,
      firmwareVersion: null,
      boardId: null,
      canHealthy: false,
      error: null,
      linkProblem: null,
      unreadableFramesInARow: 0,
    });
  },
}));
