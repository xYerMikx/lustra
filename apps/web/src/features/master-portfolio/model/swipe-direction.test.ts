import { describe, expect, it } from 'vitest'

import { swipeDirection } from '@/features/master-portfolio/model/swipe-direction'

describe('swipeDirection', () => {
  it('returns next for a left swipe and prev for a right swipe', () => {
    expect(swipeDirection(80, 10)).toBe('next')
    expect(swipeDirection(10, 80)).toBe('prev')
  })

  it('ignores small movements', () => {
    expect(swipeDirection(10, 20)).toBeNull()
  })
})
