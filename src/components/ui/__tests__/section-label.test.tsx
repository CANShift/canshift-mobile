import * as React from "react";
import { render } from "@testing-library/react-native";
import { SectionLabel } from "../section-label";

describe("SectionLabel", () => {
  it("renders the text child", async () => {
    const { getByText } = await render(<SectionLabel>BRIGHTNESS</SectionLabel>);
    expect(getByText("BRIGHTNESS")).toBeTruthy();
  });

  it("applies muted text className", async () => {
    const { getByText } = await render(<SectionLabel>BRIGHTNESS</SectionLabel>);
    const node = getByText("BRIGHTNESS") as unknown as {
      props: { className?: string };
    };
    expect(node.props.className ?? "").toContain("text-text-muted");
  });
});
