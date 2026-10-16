import { Toast } from "../components/ui/toast";
import { log } from "../stores/log.store";
import { STRINGS } from "../strings";
import { errText } from "./error-text";

export const reportFailure = (
  action: string,
  err: unknown,
  userMessage: string,
): void => {
  log("warn", `${action} failed: ${errText(err)}`);
  Toast.show({ type: "error", text1: userMessage });
};

export const reportDashFailure = (action: string, err: unknown): void => {
  reportFailure(action, err, STRINGS.genericError);
};
