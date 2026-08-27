import { describe, expect, it, vi } from 'vitest'

import { openPortfolioSlide } from '@/features/master-portfolio/model/open-portfolio-slide'

describe('openPortfolioSlide', () => {
  it('returns nothing when the carousel is not openable', () => {
    expect(openPortfolioSlide(undefined, 0)).toBeUndefined()
  })

  it('opens the requested slide', () => {
    const open = vi.fn()
    const openSlide = openPortfolioSlide(open, 2)

    openSlide?.()

    expect(open).toHaveBeenCalledWith(2)
  })
})
