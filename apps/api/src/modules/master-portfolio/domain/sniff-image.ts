import { DomainError } from '@/common/errors/domain-error'

export const PORTFOLIO_MAX_EDGE_PX = 4000

export type SniffedImage = {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  extension: 'jpg' | 'png' | 'webp'
  width: number
  height: number
}

export function sniffImage(bytes: Buffer): SniffedImage {
  if (bytes.length < 24) {
    throw invalidImage()
  }

  if (isPng(bytes)) {
    return withBounds({
      mimeType: 'image/png',
      extension: 'png',
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
    })
  }

  if (isJpeg(bytes)) {
    const size = readJpegSize(bytes)

    return withBounds({
      mimeType: 'image/jpeg',
      extension: 'jpg',
      ...size,
    })
  }

  if (isWebp(bytes)) {
    return withBounds({
      mimeType: 'image/webp',
      extension: 'webp',
      ...readWebpSize(bytes),
    })
  }

  throw invalidImage()
}

function withBounds(image: SniffedImage): SniffedImage {
  if (image.width < 1 || image.height < 1) {
    throw invalidImage()
  }

  if (image.width > PORTFOLIO_MAX_EDGE_PX || image.height > PORTFOLIO_MAX_EDGE_PX) {
    throw new DomainError(
      'VALIDATION_FAILED',
      'Слишком большое изображение',
      { fieldErrors: { file: ['Максимум 4000 px по стороне'] } },
    )
  }

  return image
}

function isPng(bytes: Buffer): boolean {
  return (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
}

function isJpeg(bytes: Buffer): boolean {
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
}

function isWebp(bytes: Buffer): boolean {
  return (
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  )
}

function readJpegSize(bytes: Buffer): { width: number; height: number } {
  let offset = 2

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      throw invalidImage()
    }

    const marker = bytes[offset + 1]

    if (marker === undefined) {
      throw invalidImage()
    }

    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      }
    }

    const length = bytes.readUInt16BE(offset + 2)
    offset += 2 + length
  }

  throw invalidImage()
}

function readWebpSize(bytes: Buffer): { width: number; height: number } {
  const fourcc = bytes.toString('ascii', 12, 16)

  if (fourcc === 'VP8X' && bytes.length >= 30) {
    return {
      width: 1 + bytes[24]! + (bytes[25]! << 8) + (bytes[26]! << 16),
      height: 1 + bytes[27]! + (bytes[28]! << 8) + (bytes[29]! << 16),
    }
  }

  if (fourcc === 'VP8 ' && bytes.length >= 30) {
    return {
      width: bytes.readUInt16LE(26) & 0x3fff,
      height: bytes.readUInt16LE(28) & 0x3fff,
    }
  }

  throw invalidImage()
}

function invalidImage(): DomainError {
  return new DomainError('VALIDATION_FAILED', 'Нужен JPEG, PNG или WebP', {
    fieldErrors: { file: ['Загрузите JPEG, PNG или WebP'] },
  })
}
