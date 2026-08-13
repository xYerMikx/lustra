import { describe, expect, it } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { sniffImage } from '@/modules/master-portfolio/domain/sniff-image'

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

describe('sniffImage', () => {
  it('reads PNG magic bytes and dimensions', () => {
    const image = sniffImage(PNG_1X1)

    expect(image).toEqual({
      mimeType: 'image/png',
      extension: 'png',
      width: 1,
      height: 1,
    })
  })

  it('rejects unknown bytes', () => {
    expect(() => sniffImage(Buffer.from('not-an-image'))).toThrow(DomainError)
  })
})
