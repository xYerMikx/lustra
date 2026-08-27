import { describe, expect, it } from 'vitest'

import {
  carouselIndexFromScroll,
  clampCarouselIndex,
  scrollLeftForIndex,
} from '@/features/master-portfolio/model/carousel-index-from-scroll'

describe('clampCarouselIndex', () => {
  it('keeps the index inside the list', () => {
    expect(clampCarouselIndex(-1, 3)).toBe(0)
    expect(clampCarouselIndex(1, 3)).toBe(1)
    expect(clampCarouselIndex(3, 3)).toBe(2)
  })

  it('returns 0 for an empty list', () => {
    expect(clampCarouselIndex(2, 0)).toBe(0)
  })
})

describe('carouselIndexFromScroll', () => {
  it('rounds to the nearest slide', () => {
    expect(carouselIndexFromScroll(0, 320, 3)).toBe(0)
    expect(carouselIndexFromScroll(160, 320, 3)).toBe(1)
    expect(carouselIndexFromScroll(640, 320, 3)).toBe(2)
  })

  it('does not wrap past the last slide', () => {
    expect(carouselIndexFromScroll(1000, 320, 3)).toBe(2)
  })

  it('returns 0 when the track has no width', () => {
    expect(carouselIndexFromScroll(40, 0, 3)).toBe(0)
    expect(carouselIndexFromScroll(40, 320, 0)).toBe(0)
  })
})

describe('scrollLeftForIndex', () => {
  it('places the slide at a multiple of its width', () => {
    expect(scrollLeftForIndex(2, 320)).toBe(640)
    expect(scrollLeftForIndex(1, 0)).toBe(0)
  })
})
