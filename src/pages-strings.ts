export const PAGES_STRINGS = {
  title: "Dash pages",
  open: "Pages",
  back: "Device",
  backToLive: "Live",
  onScreen: "On screen",
  pageNumber: (index: number): string => String(index + 1).padStart(2, "0"),
  showOnDash: (label: string): string =>
    `SHOW PAGE ${label.toUpperCase()} ON THE DASH`,
  alreadyOnScreen: "ON SCREEN NOW",
  switching: "SWITCHING…",
  loadingTitle: "Reading the dash pages…",
  loadingBody: "This takes a moment after connecting.",
  unsupportedTitle: "Update the dash to switch pages",
  unsupportedBody:
    "This firmware doesn’t share its pages over Bluetooth. Update it from Device › Firmware.",
  failedTitle: "Couldn’t read the dash pages",
  failedBody: "Keep the phone close to the dash, then try again.",
  emptyTitle: "No pages on the dash",
  emptyBody: "Add a page in the Tuner and burn the config.",
  retry: "Try again",
  notSwitched: (label: string): string =>
    `The dash didn’t switch to ${label}. Try again.`,
  sendFailed: "Couldn’t reach the dash. Try again.",
} as const;
