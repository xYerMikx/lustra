import { describe, expect, it } from 'vitest'

import { nextCarouselIndex } from '@/shared/ui/preview-carousel/next-carousel-index'

describe('nextCarouselIndex', () => {
  it('wraps to the start after the last slide', () => {
    expect(nextCarouselIndex(0, 4)).toBe(1)
    expect(nextCarouselIndex(3, 4)).toBe(0)
  })

  it('stays at zero when there are no slides', () => {
    expect(nextCarouselIndex(2, 0)).toBe(0)
  })
})
