export type Takeover = "criticalAlert" | "reconnectFailed" | "none";

export type Banner =
  "reconnecting" | "linkProblem" | "noData" | "batteryLow" | "none";

export interface OverlayInputs {
  alertHolds: boolean;
  reconnectFailed: boolean;
  reconnecting: boolean;
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
  ["reconnectFailed", "reconnectFailed"],
];

const BANNER_ORDER: readonly Rule<Exclude<Banner, "none">>[] = [
  ["reconnecting", "reconnecting"],
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
