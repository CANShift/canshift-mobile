export type Takeover =
  "criticalAlert" | "firmwareUpdate" | "reconnectFailed" | "none";

export type Banner =
  | "reconnecting"
  | "alertStrip"
  | "linkProblem"
  | "noData"
  | "batteryLow"
  | "none";

export interface OverlayInputs {
  alertHolds: boolean;
  firmwareUpdate: boolean;
  reconnectFailed: boolean;
  reconnecting: boolean;
  alertStrip: boolean;
  linkProblem: boolean;
  noData: boolean;
  batteryLow: boolean;
}

export interface OverlayStack {
  takeover: Takeover;
  banner: Banner;
}

type Rule<T> = readonly [T, keyof OverlayInputs];

const TAKEOVER_ORDER: readonly Rule<Exclude<Takeover, "none">>[] = [
  ["criticalAlert", "alertHolds"],
  ["firmwareUpdate", "firmwareUpdate"],
  ["reconnectFailed", "reconnectFailed"],
];

const BANNER_ORDER: readonly Rule<Exclude<Banner, "none">>[] = [
  ["reconnecting", "reconnecting"],
  ["alertStrip", "alertStrip"],
  ["linkProblem", "linkProblem"],
  ["noData", "noData"],
  ["batteryLow", "batteryLow"],
];

const firstRaised = <T>(
  order: readonly Rule<T>[],
  inputs: OverlayInputs,
): T | undefined => order.find(([, input]) => inputs[input])?.[0];

export const resolveOverlays = (inputs: OverlayInputs): OverlayStack => ({
  takeover: firstRaised(TAKEOVER_ORDER, inputs) ?? "none",
  banner: firstRaised(BANNER_ORDER, inputs) ?? "none",
});
