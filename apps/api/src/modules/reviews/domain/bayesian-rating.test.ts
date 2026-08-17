import { describe, expect, it } from 'vitest'

import { BAYES_C, BAYES_M, bayesianRating } from '@/modules/reviews/domain/bayesian-rating'

describe('bayesianRating', () => {
  it('returns zero when there are no published ratings', () => {
    expect(bayesianRating([])).toEqual({
      avg: 0,
      count: 0,
      histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    })
  })

  it('smooths a single five-star review toward the prior', () => {
    const result = bayesianRating([5])
    const expected = (5 + BAYES_M * BAYES_C) / (1 + BAYES_M)

    expect(result.count).toBe(1)
    expect(result.avg).toBe(Math.round(expected * 100) / 100)
    expect(result.avg).toBeLessThan(5)
    expect(result.histogram[5]).toBe(1)
  })

  it('recalculates after a rating is removed', () => {
    const withTwo = bayesianRating([5, 3])
    const afterDelete = bayesianRating([5])

    expect(withTwo.count).toBe(2)
    expect(afterDelete.count).toBe(1)
    expect(afterDelete.avg).not.toBe(withTwo.avg)
  })
})
