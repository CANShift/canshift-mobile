import Constants from "expo-constants";
import { z } from "zod";

const legacySchema = z.looseObject({
  nativeAppVersion: z.string().min(1).optional(),
  version: z.string().min(1).optional(),
});

export const readAppVersion = (): string | null => {
  const fromConfig = Constants.expoConfig?.version;
  if (typeof fromConfig === "string" && fromConfig.length > 0)
    return fromConfig;

  const legacy = legacySchema.safeParse(Constants);
  if (!legacy.success) return null;
  return legacy.data.nativeAppVersion ?? legacy.data.version ?? null;
};
