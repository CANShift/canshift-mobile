import * as React from "react";
import { render } from "@testing-library/react-native";
import { DeviceRow } from "../DeviceRow";
import type { ScanResult } from "../../../services/ble.service";

const connectingDevice: ScanResult = {
  id: "1",
  name: "CANSHIFT-8F21",
  rssi: -58,
};
const idleDevice: ScanResult = { id: "2", name: "CANSHIFT-2C04", rssi: -71 };

const renderPair = () =>
  render(
    <>
      <DeviceRow
        device={connectingDevice}
        connecting
        disabled={false}
        onPress={jest.fn()}
      />
      <DeviceRow
        device={idleDevice}
        connecting={false}
        disabled
        onPress={jest.fn()}
      />
    </>,
  );

describe("DeviceRow", () => {
  it("marks only the connecting device", async () => {
    const { getAllByText } = await renderPair();
    expect(getAllByText("CONNECTING")).toHaveLength(1);
  });

  it("shows the signal of every device that is not connecting", async () => {
    const { getByText, queryByText } = await renderPair();
    expect(getByText("-71 dBm")).toBeTruthy();
    expect(queryByText("-58 dBm")).toBeNull();
  });

  it("tints the connecting detail with the engaged accent", async () => {
    const { getByText } = await renderPair();
    const node = getByText("CONNECTING") as unknown as {
      props: { style?: unknown };
    };
    expect(JSON.stringify(node.props.style)).toContain("#FF4747");
  });
});
