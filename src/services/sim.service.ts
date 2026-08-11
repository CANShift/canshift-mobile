import { useDeviceStore } from "../stores/device.store";
import { useSignalsStore } from "../stores/signals.store";
import { clearBuffer } from "../stores/telemetry.store";
import { log } from "../stores/log.store";
import { type TelemetrySample } from "./ble.validators";

const simGlobal = globalThis as typeof globalThis & {
  __canshiftSimTick?: ReturnType<typeof setInterval>;
};

let elapsed = 0;

const IDLE_RPM = 850;
const MAX_RPM = 6800;
const RPM_RESPONSE = 0.08;

let currentRpm = IDLE_RPM;

const throttle = (t: number) => Math.round(Math.abs(Math.sin(t / 8)) * 100);
const targetRpm = (tps: number) =>
  IDLE_RPM + ((MAX_RPM - IDLE_RPM) * tps) / 100;
const speed = (r: number) => Math.round(r * 0.028);
const gear = (r: number) => {
  if (r < 1200) return 1;
  if (r < 2000) return 2;
  if (r < 3000) return 3;
  if (r < 4200) return 4;
  return 5;
};

const PULL_BACK = 0.02;
const BOOST_RESPONSE = 0.1;

const SENSOR_BASE = {
  ct: 88,
  ot: 95,
  op: 4.2,
  lam: 1.0,
  bat: 13.8,
  iat: 35,
} as const;

const SENSOR_JITTER = {
  ct: 0.2,
  ot: 0.25,
  op: 0.04,
  lam: 0.006,
  bat: 0.02,
  iat: 0.2,
} as const;

type SensorKey = keyof typeof SENSOR_BASE;

let sensors = { ...SENSOR_BASE };

const drift = (key: SensorKey): number => {
  const next =
    sensors[key] +
    (SENSOR_BASE[key] - sensors[key]) * PULL_BACK +
    (Math.random() - 0.5) * SENSOR_JITTER[key];
  sensors = { ...sensors, [key]: next };
  return next;
};

let currentBoost = 0;

const boost = (tps: number): number => {
  const target = tps > 50 ? 0.4 + (tps / 100) * 0.5 : 0;
  currentBoost += (target - currentBoost) * BOOST_RESPONSE;
  return currentBoost;
};

export const start = () => {
  if (simGlobal.__canshiftSimTick) return;
  const { setDevice, setFirmwareStatus, setMode } = useDeviceStore.getState();
  setDevice("SIM", "CANShift (sim)");
  setFirmwareStatus("sim", true);
  setMode("sim");
  clearBuffer();
  log("info", "Simulation mode started");

  elapsed = 0;
  currentRpm = IDLE_RPM;
  currentBoost = 0;
  sensors = { ...SENSOR_BASE };
  simGlobal.__canshiftSimTick = setInterval(() => {
    elapsed += 0.1;
    const tps = throttle(elapsed);
    currentRpm += (targetRpm(tps) - currentRpm) * RPM_RESPONSE;
    const r = Math.round(currentRpm);
    const s = speed(r);
    const g = gear(r);

    const sample: TelemetrySample = {
      r,
      s,
      g,
      tps,
      ct: Math.round(drift("ct")),
      ot: Math.round(drift("ot")),
      op: parseFloat(drift("op").toFixed(1)),
      lam: parseFloat(drift("lam").toFixed(2)),
      bat: parseFloat(drift("bat").toFixed(1)),
      bst: parseFloat(boost(tps).toFixed(2)),
      iat: Math.round(drift("iat")),
    };
    useSignalsStore.getState().update(sample);
  }, 100);
};

export const stop = () => {
  if (simGlobal.__canshiftSimTick) {
    clearInterval(simGlobal.__canshiftSimTick);
    delete simGlobal.__canshiftSimTick;
  }
  useDeviceStore.getState().disconnect();
  useSignalsStore.getState().markStale();
  clearBuffer();
  log("info", "Simulation mode stopped");
};

export const isRunning = () => {
  return simGlobal.__canshiftSimTick !== undefined;
};
