/** 1×1 PNG used as a fake portfolio photo in mocked e2e. */

export const STUB_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

export function stubPhotoFile(name: string) {
  return {
    name,
    mimeType: 'image/png',
    buffer: STUB_PNG,
  }
}
