import { useDeviceStore } from "../stores/device.store";
import { backToScan, retryReconnect } from "../services/session-exit";
import { STRINGS } from "../strings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

const ReconnectFailedDialog = () => {
  const dashName =
    useDeviceStore((s) => s.lastDashName) ?? STRINGS.connect.theDash;
  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {STRINGS.connect.reconnectFailedTitle(dashName)}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {STRINGS.connect.reconnectFailedBody}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={backToScan}>
            {STRINGS.connect.scanForDashes}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="default"
            onPress={() => void retryReconnect()}
          >
            {STRINGS.connect.tryAgain}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReconnectFailedDialog;
