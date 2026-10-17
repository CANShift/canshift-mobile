const WORKSHOP_MODE_BOARDS: ReadonlySet<string> = new Set(["waveshare_s3_28"]);

export const hasWorkshopMode = (boardId: string): boolean =>
  WORKSHOP_MODE_BOARDS.has(boardId);
