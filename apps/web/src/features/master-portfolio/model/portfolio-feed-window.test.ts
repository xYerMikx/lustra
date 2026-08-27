import { describe, expect, it } from 'vitest'

import {
  initialPortfolioVisibleCount,
  nextPortfolioVisibleCount,
  portfolioFeedPageSize,
} from '@/features/master-portfolio/model/portfolio-feed-window'

describe('portfolioFeedPageSize', () => {
  it('loads two photos at a time on a phone', () => {
    expect(portfolioFeedPageSize(390)).toBe(2)
  })

  it('loads four photos at a time on a tablet', () => {
    expect(portfolioFeedPageSize(768)).toBe(4)
    expect(portfolioFeedPageSize(900)).toBe(4)
  })

  it('loads six photos at a time on a desktop', () => {
    expect(portfolioFeedPageSize(1024)).toBe(6)
    expect(portfolioFeedPageSize(1440)).toBe(6)
  })
})

describe('initialPortfolioVisibleCount', () => {
  it('caps the server window at five photos', () => {
    expect(initialPortfolioVisibleCount(0)).toBe(0)
    expect(initialPortfolioVisibleCount(3)).toBe(3)
    expect(initialPortfolioVisibleCount(12)).toBe(5)
  })
})

describe('nextPortfolioVisibleCount', () => {
  it('appends one page without passing the total', () => {
    expect(nextPortfolioVisibleCount(5, 2, 12)).toBe(7)
    expect(nextPortfolioVisibleCount(11, 6, 12)).toBe(12)
    expect(nextPortfolioVisibleCount(12, 6, 12)).toBe(12)
  })
})
