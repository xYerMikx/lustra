import { describe, expect, it } from 'vitest'

import { averageStarRating } from '@/features/reviews/model/average-star-rating'

describe('averageStarRating', () => {
  it('returns zero when there are no stars', () => {
    expect(averageStarRating([])).toEqual({ avg: 0, count: 0 })
    expect(averageStarRating([null, undefined])).toEqual({ avg: 0, count: 0 })
  })

  it('shows a single five-star review as 5.0', () => {
    expect(averageStarRating([5])).toEqual({ avg: 5, count: 1 })
  })

  it('averages published stars and skips comments without a rating', () => {
    expect(averageStarRating([5, null, 3])).toEqual({ avg: 4, count: 2 })
  })
})
