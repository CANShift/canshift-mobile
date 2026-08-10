import { BleErrorCode } from "react-native-ble-plx";
import { withGattRetry } from "./ble.retry";

const bleError = (errorCode: BleErrorCode, message: string): Error =>
  Object.assign(new Error(message), { errorCode });

const writeFailed = () =>
  bleError(BleErrorCode.CharacteristicWriteFailed, "GATT write failed");
const timedOut = () =>
  bleError(BleErrorCode.OperationTimedOut, "timed out waiting for GATT");

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

  it("retries once on a transient GATT write failure then returns success", async () => {
    const op = jest
      .fn()
      .mockRejectedValueOnce(writeFailed())
      .mockResolvedValueOnce("ok");

    const promise = withGattRetry(op, { retries: 1, backoffMs: 500 });
    await jest.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("ok");
    expect(op).toHaveBeenCalledTimes(2);
  });

  it("throws immediately on a non-transient error without retrying", async () => {
    const op = jest
      .fn()
      .mockRejectedValue(
        bleError(BleErrorCode.DeviceNotConnected, "Not connected"),
      );

    await expect(withGattRetry(op)).rejects.toThrow("Not connected");
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("does not retry an error it cannot classify, however transient the wording", async () => {
    const op = jest.fn().mockRejectedValue(new Error("GATT busy, timed out"));

    await expect(withGattRetry(op, { retries: 2 })).rejects.toThrow(
      "GATT busy",
    );
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("backs off exponentially between attempts (500ms then 1000ms)", async () => {
    const op = jest
      .fn()
      .mockRejectedValueOnce(writeFailed())
      .mockRejectedValueOnce(writeFailed())
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
    const op = jest.fn().mockRejectedValue(writeFailed());
    const assertion = expect(
      withGattRetry(op, { retries: 5, backoffMs: 1000, maxBackoffMs: 2000 }),
    ).rejects.toThrow("GATT write failed");
    await jest.runAllTimersAsync();
    await assertion;
    expect(op).toHaveBeenCalledTimes(6);
  });

  it("throws after exhausting all retries on a persistent transient error", async () => {
    const op = jest.fn().mockRejectedValue(timedOut());

    const assertion = expect(
      withGattRetry(op, { retries: 2, backoffMs: 100 }),
    ).rejects.toThrow("timed out waiting for GATT");

    await jest.runAllTimersAsync();
    await assertion;

    expect(op).toHaveBeenCalledTimes(3);
  });
});
