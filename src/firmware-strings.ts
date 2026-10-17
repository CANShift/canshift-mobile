const megabytes = (bytes: number): string => (bytes / 1_000_000).toFixed(1);

const stillRuns = (version: string): string =>
  `Nothing was installed — your dash still runs ${version}.`;

export const FIRMWARE_STRINGS = {
  cardTitle: "Firmware update",
  onTheDash: "On the dash",
  latest: "Latest",
  checking: "Checking for updates…",
  upToDate: "Your dash is up to date.",
  available: (version: string): string => `Version ${version} is available.`,
  download: (bytes: number): string => `Download · ${megabytes(bytes)} MB`,
  downloading: "Downloading…",
  ready: "Downloaded and checked. Ready to install.",
  update: "Update the dash",
  unsupported:
    "This dash has no workshop mode, so it updates over USB with the tuner.",
  noBuild: "There is no update for this dash yet.",
  unavailable:
    "Couldn’t check for updates. Check the phone is online, then try again.",
  offline:
    "The download didn’t finish. Check the phone is online, then try again.",
  damaged: "The download arrived damaged. Try again.",
  notFirmware: "The download isn’t a firmware for this dash. Try again later.",
  badSignature: "The download has no valid signature. Try again later.",
  tryAgain: "Try again",
  connectFirst: "Connect to the dash to check for updates.",
  close: "Close",
  cancel: "Cancel",
  prepareTitle: "Put the dash in workshop mode",
  prepareBody:
    "On the dash, open Settings and tap Workshop mode. The car must be stopped. The dash then shows its Wi-Fi name, a password and a QR code.",
  prepareNote:
    "Bluetooth turns off while the dash is in workshop mode. The app reconnects when the update is done.",
  prepareNext: "The dash shows the workshop card",
  wifiTitle: "Join the dash’s Wi-Fi",
  wifiBody: "Type the network name and the password shown on the dash.",
  wifiManualBody:
    "Open Settings › Wi-Fi and join the network shown on the dash with its password, or scan the dash’s QR code with the Camera app. Then come back here.",
  wifiQrHint:
    "Or scan the QR code on the dash with the Camera app, then tap I’m on the dash’s Wi-Fi.",
  networkName: "Network name",
  password: "Password",
  join: "Join",
  joining: "Joining…",
  onDashWifi: "I’m on the dash’s Wi-Fi",
  openSettings: "Open Settings",
  joinDenied: "The phone didn’t join. Tap Join again and choose Join.",
  joinInvalid: "That name or password doesn’t match. Check them on the dash.",
  joinFailed:
    "The phone couldn’t join the dash’s Wi-Fi. Join it in Settings instead.",
  connecting: "Connecting to the dash…",
  unreachableTitle: "Can’t reach the dash",
  unreachableBody:
    "Check the phone is on the dash’s Wi-Fi and the dash shows the workshop card. If iOS asked, allow CANShift to use the local network (Settings › CANShift › Local Network).",
  busyTitle: "Another device is connected to the dash",
  busyBody:
    "Close the tuner on the other phone or computer, wait a few seconds, then try again.",
  confirmTitle: (version: string): string => `Install version ${version}?`,
  confirmBody:
    "The dash restarts and can’t be used for about 2 minutes. Keep the car’s power on and stay near the dash. Your settings are kept.",
  confirmRuns: (version: string): string =>
    `Your dash runs version ${version}.`,
  confirmInstall: "Install and restart",
  updatingTo: (version: string): string => `Updating to ${version}`,
  percent: (percent: number): string => `${String(percent)}%`,
  progress: (sent: number, total: number): string =>
    `${megabytes(sent)} of ${megabytes(total)} MB`,
  stepUpload: "Uploading",
  stepSignature: "Checking the signature",
  stepRestart: "Restarting the dash",
  stepReconnect: "Reconnecting over Bluetooth",
  doneUpload: "Uploaded",
  doneSignature: "Signature checked",
  doneRestart: "Dash restarted",
  doneReconnect: "Connected again",
  keepPower: "Keep the car’s power on",
  keepOpen: "Keep this screen open and stay near the dash",
  cancelUpload: "Cancel upload",
  cancelHint: "Possible until the upload finishes. Nothing is installed yet.",
  successTitle: (version: string): string => `Updated to ${version}`,
  successBody:
    "The dash restarted and is connected again. Your settings were kept.",
  done: "Done",
  failureTitle: "Update didn’t install",
  signatureMismatch: (version: string): string =>
    `The signature doesn’t match the firmware. ${stillRuns(version)}`,
  signatureAdvice: "Download the update again, then try again.",
  otherDash: (version: string): string =>
    `This firmware is for a different dash. ${stillRuns(version)}`,
  refused: (version: string): string =>
    `The dash refused the update. ${stillRuns(version)}`,
  refusedAdvice: "Restart the dash and try again.",
  wifiDropped: (version: string): string =>
    `The Wi-Fi dropped during the upload. ${stillRuns(version)}`,
  wifiDroppedAdvice:
    "Check the phone is still on the dash’s Wi-Fi, then try again.",
  rolledBack: (version: string): string =>
    `The new version didn’t start, so the dash went back to ${version}. It still works as before.`,
  rolledBackAdvice: "Try the update again later.",
  notBackTitle: "The dash hasn’t reconnected",
  notBack:
    "The app can’t tell yet which version the dash runs. If the dash still shows the workshop card, tap Leave on it.",
  notBackAdvice: "Then reconnect from the Device tab to see its version.",
  leaveHint:
    "Closing takes the dash out of workshop mode so you can drive again.",
} as const;
