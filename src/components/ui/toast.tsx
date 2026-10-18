import * as React from "react";
import { StyleSheet } from "react-native";
import RNToast, {
  BaseToast,
  ErrorToast,
  type BaseToastProps,
  type ToastConfig,
} from "react-native-toast-message";
import { UiColors, UiRadius } from "../../theme/ui-tokens";

const baseStyle = {
  backgroundColor: UiColors.surface,
  borderRadius: UiRadius.tile,
  borderLeftWidth: 4,
  borderColor: UiColors.border,
  borderTopWidth: 1,
  borderRightWidth: 1,
  borderBottomWidth: 1,
  height: "auto" as const,
  minHeight: 60,
  paddingVertical: 8,
} as const;

const styles = StyleSheet.create({
  success: { ...baseStyle, borderLeftColor: UiColors.success },
  error: { ...baseStyle, borderLeftColor: UiColors.warning },
  info: { ...baseStyle, borderLeftColor: UiColors.textMuted },
  content: { paddingHorizontal: 12 },
  text1: { color: UiColors.text, fontSize: 15, fontWeight: "600" },
  text2: { color: UiColors.textSecondary, fontSize: 13 },
});

const toastConfig: ToastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={styles.success}
      contentContainerStyle={styles.content}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={styles.error}
      contentContainerStyle={styles.content}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={styles.info}
      contentContainerStyle={styles.content}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
};

export const Toaster = (): React.ReactElement => {
  return <RNToast config={toastConfig} />;
};
Toaster.displayName = "Toaster";

export { RNToast as Toast };
export type { ToastShowParams } from "react-native-toast-message";
