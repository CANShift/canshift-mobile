export const CAN_CONSOLE_STRINGS = {
  canFilter: "Filter by ID or data, e.g. 3E0",
  canSummary: (ids: number, framesPerSecond: number): string =>
    `${String(ids)} ${ids === 1 ? "ID" : "IDs"} · ${String(framesPerSecond)} frames/s`,
  canChangedHint: "Changed bytes are bright",
  canColumnId: "ID",
  canColumnData: "Data",
  canColumnRate: "Rate",
  canOverflow: "The dash tracks 64 IDs. Newer ones are left out.",
  canOffTitle: "Connect to a dash to watch its CAN bus.",
  canOffBody: "Frames show up here once the phone is linked.",
  canUnavailableTitle: "This dash doesn’t stream CAN frames.",
  canUnavailableBody:
    "Update the dash firmware to watch the bus from the phone.",
  canListeningTitle: "Listening to the CAN bus…",
  canListeningBody: "No frames yet. Check that the bus is powered and wired.",
} as const;
