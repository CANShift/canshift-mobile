const ESP_IMAGE_MAGIC = 0xe9;
const APP_DESC_MAGIC = 0xabcd5432;
const APP_DESC_OFFSET = 0x20;
const APP_VERSION_OFFSET = APP_DESC_OFFSET + 16;
const APP_TEXT_BYTES = 32;
const APP_DESC_BYTES = 256;
const MIN_APP_IMAGE_BYTES = APP_DESC_OFFSET + APP_DESC_BYTES;
const WORD_BYTES = 4;

export const SIGNATURE_BYTES = 64;

const readUint32LE = (bytes: Uint8Array, offset: number): number =>
  new DataView(bytes.buffer, bytes.byteOffset + offset, WORD_BYTES).getUint32(
    0,
    true,
  );

const readText = (bytes: Uint8Array, offset: number): string => {
  const field = bytes.subarray(offset, offset + APP_TEXT_BYTES);
  const end = field.indexOf(0);
  return String.fromCharCode(...(end === -1 ? field : field.subarray(0, end)));
};

const isAppImage = (bytes: Uint8Array): boolean =>
  bytes.byteLength >= MIN_APP_IMAGE_BYTES &&
  bytes[0] === ESP_IMAGE_MAGIC &&
  readUint32LE(bytes, APP_DESC_OFFSET) === APP_DESC_MAGIC;

export const appImageVersion = (bytes: Uint8Array): string | null =>
  isAppImage(bytes) ? readText(bytes, APP_VERSION_OFFSET) : null;
