import type { CanMonitorEntry } from "@canshift/core/wire";
import { useCanMonitorStore } from "../stores/can-monitor.store";

const TICK_MS = 100;
const TICKS_PER_SECOND = 1000 / TICK_MS;

interface SimCanId {
  id: number;
  hz: number;
  data: (tick: number) => number[];
}

const word = (value: number): number[] => [(value >> 8) & 0xff, value & 0xff];

const wave = (tick: number, period: number, low: number, high: number) =>
  Math.round(
    low + ((high - low) * (1 + Math.sin((tick / period) * 2 * Math.PI))) / 2,
  );

const SIM_IDS: readonly SimCanId[] = [
  {
    id: 0x360,
    hz: 50,
    data: (t) => [
      ...word(wave(t, 80, 850, 6800)),
      ...word(wave(t, 80, 30, 180)),
      0x1f,
      0x40,
      0,
      0,
    ],
  },
  {
    id: 0x361,
    hz: 50,
    data: (t) => [...word(wave(t, 120, 20, 60)), 0x01, 0x72, 0, 0x3c, 0, 0],
  },
  { id: 0x362, hz: 20, data: () => [0x03, 0xe8, 0, 0, 0, 0, 0, 0] },
  {
    id: 0x368,
    hz: 20,
    data: (t) => [...word(wave(t, 60, 120, 160)), 0, 0, 0, 0, 0, 0],
  },
  { id: 0x369, hz: 10, data: () => [0, 0, 0, 0, 0, 0, 0, 0] },
  {
    id: 0x36a,
    hz: 20,
    data: (t) => [0x01, 0x2c, wave(t, 40, 0, 8), 0, 0, 0, 0, 0],
  },
  {
    id: 0x370,
    hz: 20,
    data: (t) => [...word(wave(t, 80, 0, 220)), 0, 0, 0, 0, 0, 0],
  },
  { id: 0x372, hz: 10, data: () => [0, 0x8a, 0, 0, 0, 0, 0, 0] },
  {
    id: 0x3e0,
    hz: 5,
    data: (t) => [
      ...word(wave(t, 300, 2900, 3000)),
      0x0b,
      0x0e,
      0x0a,
      0xf0,
      0x0b,
      0x22,
    ],
  },
];

const framesThisTick = (hz: number, tick: number): number =>
  Math.floor(((tick + 1) * hz) / TICKS_PER_SECOND) -
  Math.floor((tick * hz) / TICKS_PER_SECOND);

const entriesAt = (tick: number): CanMonitorEntry[] =>
  SIM_IDS.flatMap((sim) => {
    const count = framesThisTick(sim.hz, tick);
    if (count === 0) return [];
    return [
      { id: sim.id, extended: false, data: sim.data(tick), count, ageMs: 0 },
    ];
  });

let simTimer: ReturnType<typeof setInterval> | null = null;

export const startSimCan = (): void => {
  stopSimCan();
  const store = useCanMonitorStore.getState();
  store.reset();
  store.setFeed("listening");
  let tick = 0;
  simTimer = setInterval(() => {
    useCanMonitorStore.getState().ingest({
      deviceMs: tick * TICK_MS,
      overflow: false,
      filtered: false,
      entries: entriesAt(tick),
    });
    tick++;
  }, TICK_MS);
};

export const stopSimCan = (): void => {
  if (simTimer === null) return;
  clearInterval(simTimer);
  simTimer = null;
};
