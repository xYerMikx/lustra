import { describe, expect, it } from 'vitest'
import type { BookingClientView } from '@lustra/contracts'

import { canLeaveReview } from '@/features/reviews/model/can-leave-review'

function booking(
  overrides: Partial<Pick<BookingClientView, 'status' | 'completedAt' | 'review'>>,
) {
  return {
    status: 'completed' as const,
    completedAt: '2026-08-01T12:00:00.000Z',
    review: null,
    ...overrides,
  }
}

describe('canLeaveReview', () => {
  const now = new Date('2026-08-10T12:00:00.000Z')

  it('allows a completed booking without a review inside the window', () => {
    expect(canLeaveReview(booking({}), now)).toBe(true)
  })

  it('blocks when a review already exists', () => {
    expect(
      canLeaveReview(
        booking({
          review: {
            id: '11111111-1111-4111-8111-111111111111',
            status: 'published',
            rating: 5,
          },
        }),
        now,
      ),
    ).toBe(false)
  })

  it('blocks after 14 days', () => {
    expect(canLeaveReview(booking({}), new Date('2026-08-16T12:00:01.000Z'))).toBe(
      false,
    )
  })
})
