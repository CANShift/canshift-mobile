import { Toast } from "../components/ui/toast";
import { log } from "../stores/log.store";
import { STRINGS } from "../strings";
import { errText } from "./error-text";

export const reportDashFailure = (action: string, err: unknown): void => {
  log("warn", `${action} failed: ${errText(err)}`);
  Toast.show({ type: "error", text1: STRINGS.genericError });
};
