import { Share } from "react-native";
import { File, Paths } from "expo-file-system";

export const shareTextFile = async (
  fileName: string,
  content: string,
  title: string,
): Promise<void> => {
  const file = new File(Paths.cache, fileName);
  await file.write(content);
  await Share.share({ url: file.uri, title });
};
