import * as React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import { Section } from "../section";

describe("Section", () => {
  it("renders the title when provided", async () => {
    const { getByText } = await render(
      <Section title="BRIGHTNESS">
        <Text>child</Text>
      </Section>,
    );
    expect(getByText("BRIGHTNESS")).toBeTruthy();
    expect(getByText("child")).toBeTruthy();
  });

  it("omits the title when not provided", async () => {
    const { queryByText, getByText } = await render(
      <Section>
        <Text>only-child</Text>
      </Section>,
    );
    expect(queryByText("SLEEP")).toBeNull();
    expect(getByText("only-child")).toBeTruthy();
  });
});
