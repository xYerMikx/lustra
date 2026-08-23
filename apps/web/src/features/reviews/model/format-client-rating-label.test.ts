import { describe, expect, it } from 'vitest'

import { formatClientRatingLabel } from '@/features/reviews/model/format-client-rating-label'

describe('formatClientRatingLabel', () => {
  it('shows a fallback when there are no ratings', () => {
    expect(formatClientRatingLabel(0, 0)).toBe('пока нет оценок')
  })

  it('shows average and count when ratings exist', () => {
    expect(formatClientRatingLabel(4.58, 12)).toBe('4.6 · 12')
  })
})
