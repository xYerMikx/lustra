import { describe, expect, it } from 'vitest'

import { portfolioRatio } from '@/features/master-portfolio/model/portfolio-ratio'

describe('portfolioRatio', () => {
  it('classifies portrait landscape and square', () => {
    expect(portfolioRatio(800, 1000)).toBe('portrait')
    expect(portfolioRatio(1200, 800)).toBe('landscape')
    expect(portfolioRatio(1000, 1000)).toBe('square')
  })
})
