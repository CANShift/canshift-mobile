import { withGattRetry } from "./ble.retry";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("withGattRetry", () => {
  it("returns result immediately when op succeeds on first try", async () => {
    const op = jest.fn().mockResolvedValue("ok");
    const result = await withGattRetry(op);
    expect(result).toBe("ok");
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("retries once on a transient GATT error then returns success", async () => {
    const op = jest
      .fn()
      .mockRejectedValueOnce(new Error("GATT_BUSY: write failed"))
      .mockResolvedValueOnce("ok");

    const promise = withGattRetry(op, { retries: 1, backoffMs: 500 });
    await jest.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("ok");
    expect(op).toHaveBeenCalledTimes(2);
  });

  it("throws immediately on a non-transient error without retrying", async () => {
    const op = jest.fn().mockRejectedValue(new Error("Not connected"));

    await expect(withGattRetry(op)).rejects.toThrow("Not connected");
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("backs off exponentially between attempts (500ms then 1000ms)", async () => {
    const op = jest
      .fn()
      .mockRejectedValueOnce(new Error("GATT busy"))
      .mockRejectedValueOnce(new Error("GATT busy"))
      .mockResolvedValueOnce("ok");

    const promise = withGattRetry(op, { retries: 2, backoffMs: 500 });
    await Promise.resolve();
    expect(op).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(499);
    expect(op).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(op).toHaveBeenCalledTimes(2);

    await jest.advanceTimersByTimeAsync(999);
    expect(op).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(1);
    expect(op).toHaveBeenCalledTimes(3);

    await expect(promise).resolves.toBe("ok");
  });

  it("caps the backoff at maxBackoffMs", async () => {
    const op = jest.fn().mockRejectedValue(new Error("GATT busy"));
    const assertion = expect(
      withGattRetry(op, { retries: 5, backoffMs: 1000, maxBackoffMs: 2000 }),
    ).rejects.toThrow("GATT busy");
    await jest.runAllTimersAsync();
    await assertion;
    expect(op).toHaveBeenCalledTimes(6);
  });

  it("throws after exhausting all retries on a persistent transient error", async () => {
    const transientErr = new Error("timed out waiting for GATT response");
    const op = jest.fn().mockRejectedValue(transientErr);

    const assertion = expect(
      withGattRetry(op, { retries: 2, backoffMs: 100 }),
    ).rejects.toThrow("timed out waiting for GATT response");

    await jest.runAllTimersAsync();
    await assertion;

    expect(op).toHaveBeenCalledTimes(3);
  });
});
