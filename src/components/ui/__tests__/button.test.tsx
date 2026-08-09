import * as React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../button";

describe("Button", () => {
  it("renders the text child", async () => {
    const { getByText } = await render(<Button>Save</Button>);
    expect(getByText("Save")).toBeTruthy();
  });

  it("fires onPress when pressed", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<Button onPress={onPress}>Save</Button>);
    await fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress when disabled", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <Button onPress={onPress} disabled>
        Save
      </Button>,
    );
    await fireEvent.press(getByRole("button"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("applies the destructive variant className", async () => {
    const { getByRole } = await render(
      <Button variant="destructive">Delete</Button>,
    );
    const node = getByRole("button") as unknown as {
      props: { className?: string };
    };
    expect(node.props.className ?? "").toContain("bg-destructive");
  });

  it("reflects accessibilityState.disabled", async () => {
    const { getByRole } = await render(<Button disabled>Save</Button>);
    const node = getByRole("button") as unknown as {
      props: { accessibilityState?: { disabled?: boolean } };
    };
    expect(node.props.accessibilityState?.disabled).toBe(true);
  });
});
