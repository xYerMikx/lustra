import { describe, expect, it } from 'vitest'

import { bayesianRating } from '@/modules/reviews/domain/bayesian-rating'

describe('bayesianRating', () => {
  it('returns zero when there are no published ratings', () => {
    expect(bayesianRating([])).toEqual({
      avg: 0,
      count: 0,
      histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    })
  })

  it('shows a single five-star review as 5.0', () => {
    const result = bayesianRating([5])

    expect(result.count).toBe(1)
    expect(result.avg).toBe(5)
    expect(result.histogram[5]).toBe(1)
  })

  it('averages mixed published ratings', () => {
    expect(bayesianRating([5, 3]).avg).toBe(4)
  })

  it('recalculates after a rating is removed', () => {
    const withTwo = bayesianRating([5, 3])
    const afterDelete = bayesianRating([5])

    expect(withTwo.count).toBe(2)
    expect(afterDelete.count).toBe(1)
    expect(afterDelete.avg).toBe(5)
    expect(afterDelete.avg).not.toBe(withTwo.avg)
  })
})
