import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { log } from "../stores/log.store";
import { STRINGS } from "../strings";
import { TouchTarget, UiColors } from "../theme/ui-tokens";
import { BigButton } from "./buttons/BigButton";

interface Props {
  children: React.ReactNode;
}

interface State {
  crashed: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { crashed: false };

  static getDerivedStateFromError(): State {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    const stack = info.componentStack ?? "(no component stack)";
    log("error", `Render crash: ${error.message}\n${stack}`);
  }

  reset = (): void => {
    this.setState({ crashed: false });
  };

  render(): React.ReactNode {
    if (!this.state.crashed) return this.props.children;
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>{STRINGS.crash.title}</Text>
        <Text style={styles.body}>{STRINGS.crash.body}</Text>
        <BigButton
          label={STRINGS.crash.retry}
          tone="primary"
          height={TouchTarget.driving}
          onPress={this.reset}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: "center",
    backgroundColor: UiColors.bg,
  },
  title: { fontSize: 26, fontWeight: "700", color: UiColors.text },
  body: { fontSize: 17, lineHeight: 25, color: UiColors.textSecondary },
});
