import { isBatteryBannerDue } from "../lib/phone-battery";
import {
  dismissBatteryBanner,
  setPhoneBatteryPercent,
  usePhoneBatteryStore,
} from "./phone-battery.store";

const bannerDue = (): boolean => {
  const { levelPercent, dismissedStatus } = usePhoneBatteryStore.getState();
  return isBatteryBannerDue(levelPercent, dismissedStatus);
};

describe("phone battery banner", () => {
  beforeEach(() => {
    usePhoneBatteryStore.setState({
      levelPercent: null,
      dismissedStatus: null,
    });
  });

  it("stays hidden while the level is fine or unknown", () => {
    setPhoneBatteryPercent(null);
    expect(bannerDue()).toBe(false);
    setPhoneBatteryPercent(80);
    expect(bannerDue()).toBe(false);
  });

  it("shows when the battery runs low and hides once dismissed", () => {
    setPhoneBatteryPercent(9);
    expect(bannerDue()).toBe(true);
    dismissBatteryBanner();
    expect(bannerDue()).toBe(false);
    setPhoneBatteryPercent(7);
    expect(bannerDue()).toBe(false);
  });

  it("comes back at the cutoff after a dismissal at low", () => {
    setPhoneBatteryPercent(9);
    dismissBatteryBanner();
    setPhoneBatteryPercent(4);
    expect(bannerDue()).toBe(true);
  });

  it("forgets the dismissal once the phone is charged again", () => {
    setPhoneBatteryPercent(9);
    dismissBatteryBanner();
    setPhoneBatteryPercent(60);
    setPhoneBatteryPercent(15);
    expect(bannerDue()).toBe(true);
  });
});
