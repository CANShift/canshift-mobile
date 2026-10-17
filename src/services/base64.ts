import { Buffer } from "buffer";

export const decodeBase64 = (value: string): string => {
  return Buffer.from(value, "base64").toString("utf8");
};

export const encodeBase64 = (value: string): string => {
  return Buffer.from(value, "utf8").toString("base64");
};

export const decodeBase64ToBytes = (value: string): Uint8Array => {
  return Uint8Array.from(Buffer.from(value, "base64"));
};

export const encodeBytesBase64 = (bytes: Uint8Array): string => {
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString(
    "base64",
  );
};
