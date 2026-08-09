import * as React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { SegmentedControl } from "../segmented-control";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo" },
] as const;

describe("SegmentedControl", () => {
  it("renders every option label", async () => {
    const { getByText } = await render(
      <SegmentedControl options={OPTIONS} value="a" onChange={jest.fn()} />,
    );
    expect(getByText("Alpha")).toBeTruthy();
    expect(getByText("Bravo")).toBeTruthy();
  });

  it("marks the active option selected", async () => {
    const { getByRole } = await render(
      <SegmentedControl options={OPTIONS} value="b" onChange={jest.fn()} />,
    );
    expect(getByRole("tab", { name: "Bravo", selected: true })).toBeTruthy();
    expect(getByRole("tab", { name: "Alpha", selected: false })).toBeTruthy();
  });

  it("calls onChange with the pressed option value", async () => {
    const onChange = jest.fn();
    const { getByText } = await render(
      <SegmentedControl options={OPTIONS} value="a" onChange={onChange} />,
    );
    await fireEvent.press(getByText("Bravo"));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
