const ESP_IMAGE_MAGIC = 0xe9;
const APP_DESC_MAGIC = 0xabcd5432;
const APP_DESC_OFFSET = 0x20;
const APP_VERSION_OFFSET = APP_DESC_OFFSET + 16;
const MIN_IMAGE_BYTES = 0x200;
const FILL_STRIDE = 251;

export const buildAppImage = (
  version: string,
  size = MIN_IMAGE_BYTES,
): Uint8Array => {
  const image = new Uint8Array(Math.max(size, MIN_IMAGE_BYTES));
  image.forEach((_, index) => {
    image[index] = index % FILL_STRIDE;
  });
  image[0] = ESP_IMAGE_MAGIC;
  new DataView(image.buffer).setUint32(APP_DESC_OFFSET, APP_DESC_MAGIC, true);
  image.fill(0, APP_VERSION_OFFSET, APP_VERSION_OFFSET + 32);
  image.set(
    Array.from(version, (char) => char.charCodeAt(0)),
    APP_VERSION_OFFSET,
  );
  return image;
};
