import { useWindowDimensions } from "react-native";

export const useIsLandscape = (): boolean => {
  const { width, height } = useWindowDimensions();
  return width > height;
};
