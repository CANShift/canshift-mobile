import { requireOptionalNativeModule } from "expo";
import { log } from "../../stores/log.store";
import { errText } from "../../lib/error-text";

export type JoinOutcome = "joined" | "denied" | "invalid" | "failed";

interface DashWifiNative {
  join: (ssid: string, passphrase: string) => Promise<string>;
  forget: (ssid: string) => void;
}

export interface DashWifi {
  canJoin: boolean;
  join: (ssid: string, passphrase: string) => Promise<JoinOutcome>;
  forget: (ssid: string) => void;
}

const JOIN_OUTCOMES: Record<string, JoinOutcome> = {
  joined: "joined",
  denied: "denied",
  invalid: "invalid",
};

const joinWith =
  (native: DashWifiNative) =>
  async (ssid: string, passphrase: string): Promise<JoinOutcome> => {
    try {
      const raw = await native.join(ssid, passphrase);
      return JOIN_OUTCOMES[raw] ?? "failed";
    } catch (err) {
      log("warn", `Joining the dash Wi-Fi failed: ${errText(err)}`);
      return "failed";
    }
  };

const NO_NATIVE_JOIN: DashWifi = {
  canJoin: false,
  join: () => Promise.resolve("failed"),
  forget: () => undefined,
};

const createDashWifi = (): DashWifi => {
  const native = requireOptionalNativeModule<DashWifiNative>("DashWifi");
  if (native === null) return NO_NATIVE_JOIN;
  return {
    canJoin: true,
    join: joinWith(native),
    forget: (ssid) => {
      native.forget(ssid);
    },
  };
};

export const dashWifi: DashWifi = createDashWifi();
