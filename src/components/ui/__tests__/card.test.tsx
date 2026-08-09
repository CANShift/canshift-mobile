import * as React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import { Card, CardHeader, CardTitle, CardContent } from "../card";

describe("Card", () => {
  it("renders children", async () => {
    const { getByText } = await render(
      <Card>
        <Text>Hello</Text>
      </Card>,
    );
    expect(getByText("Hello")).toBeTruthy();
  });

  it("renders the accent variant", async () => {
    const { getByText } = await render(
      <Card variant="accent">
        <Text>Accent</Text>
      </Card>,
    );
    expect(getByText("Accent")).toBeTruthy();
  });

  it("composes Header + Title + Content", async () => {
    const { getByText } = await render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>Body</Text>
        </CardContent>
      </Card>,
    );
    expect(getByText("Title")).toBeTruthy();
    expect(getByText("Body")).toBeTruthy();
  });
});
