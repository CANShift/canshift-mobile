import * as React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { ScreenHeader } from "./ScreenHeader";

describe("ScreenHeader", () => {
  it("renders the title without a back button by default", async () => {
    const { getByText, queryByLabelText } = await render(
      <ScreenHeader title="Settings" />,
    );

    expect(getByText("Settings")).toBeTruthy();
    expect(queryByLabelText("Back")).toBeNull();
  });

  it("calls onBack when the back button is pressed", async () => {
    const onBack = jest.fn();
    const { getByLabelText } = await render(
      <ScreenHeader title="Settings" onBack={onBack} />,
    );

    await act(() => {
      void fireEvent.press(getByLabelText("Back"));
      return Promise.resolve();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
