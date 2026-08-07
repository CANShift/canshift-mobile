import { encodeTelemetryFrame } from "@canshift/core";

import { parseDeviceSettings, parseTelemetry } from "./ble.validators";

describe("parseDeviceSettings", () => {
  it("extracts brightness and sleep, tolerating extra wire fields", () => {
    expect(
      parseDeviceSettings('{"brightness":80,"sleep":30,"rotation":180}'),
    ).toEqual({
      brightness: 80,
      sleep: 30,
    });
  });

  it("returns null for malformed JSON or a non-object", () => {
    expect(parseDeviceSettings("{brightness:80")).toBeNull();
    expect(parseDeviceSettings("42")).toBeNull();
    expect(parseDeviceSettings("[]")).toBeNull();
  });

  it("returns null when brightness or sleep is missing or non-finite", () => {
    expect(parseDeviceSettings('{"brightness":80}')).toBeNull();
    expect(parseDeviceSettings('{"sleep":30}')).toBeNull();
    expect(parseDeviceSettings('{"brightness":"80","sleep":30}')).toBeNull();
    expect(parseDeviceSettings('{"brightness":null,"sleep":30}')).toBeNull();
  });
});

describe("parseTelemetry — binary frame decode", () => {
  it("round-trips a frame encoded with the shared core codec", () => {
    const frame = { r: 4500, tps: 25, map: 100, bst: 0.8 };
    expect(parseTelemetry(encodeTelemetryFrame(frame))).toEqual(frame);
  });

  it("decodes an empty frame to an empty record", () => {
    expect(parseTelemetry(encodeTelemetryFrame({}))).toEqual({});
  });

  it("returns null for a frame shorter than the header", () => {
    expect(parseTelemetry(Uint8Array.from([0x01, 0x00]))).toBeNull();
  });

  it("returns null for an unknown version byte", () => {
    expect(parseTelemetry(Uint8Array.from([0x09, 0x00, 0x00]))).toBeNull();
  });

  it("returns null for a truncated value section", () => {
    expect(
      parseTelemetry(Uint8Array.from([0x01, 0x01, 0x00, 0xe0, 0x67])),
    ).toBeNull();
  });
});
