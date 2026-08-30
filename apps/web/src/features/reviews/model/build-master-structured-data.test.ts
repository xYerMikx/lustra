import { describe, expect, it } from 'vitest'
import type { PublicReviewView } from '@lumira/contracts'

import { buildMasterStructuredData } from '@/features/reviews/model/build-master-structured-data'

const master = {
  displayName: 'Анна',
  ratingAvg: 4.58,
  ratingCount: 1,
}

const review: PublicReviewView = {
  id: '11111111-1111-4111-8111-111111111111',
  rating: 5,
  text: 'Аккуратно',
  createdAt: '2026-08-12T12:00:00.000Z',
  clientFirstName: 'Мария',
  serviceTitle: 'Маникюр',
  masterReply: null,
  repliedAt: null,
  verified: true,
}

describe('buildMasterStructuredData', () => {
  it('includes aggregate rating and reviews when they exist', () => {
    const data = buildMasterStructuredData({ master, reviews: [review] })

    expect(data.aggregateRating?.ratingValue).toBe(4.58)
    expect(data.review?.[0]?.reviewBody).toBe('Аккуратно')
    expect(data.review?.[0]?.author.name).toBe('Мария')
  })

  it('omits rating blocks for a new master', () => {
    const data = buildMasterStructuredData({
      master: { ...master, ratingCount: 0, ratingAvg: 0 },
      reviews: [],
    })

    expect(data.aggregateRating).toBeUndefined()
    expect(data.review).toBeUndefined()
  })
})
