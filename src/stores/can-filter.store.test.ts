import { DEFAULT_CAN_ID_RANGE, useCanFilterStore } from "./can-filter.store";

beforeEach(() => {
  useCanFilterStore.setState({ range: DEFAULT_CAN_ID_RANGE });
});

describe("can filter store", () => {
  it("starts on the default id range", () => {
    expect(useCanFilterStore.getState().range).toEqual({
      from: 0x2c0,
      to: 0x2cf,
    });
  });

  it("drops the range when the filter is cleared", () => {
    useCanFilterStore.getState().clear();
    expect(useCanFilterStore.getState().range).toBeNull();
  });
});
