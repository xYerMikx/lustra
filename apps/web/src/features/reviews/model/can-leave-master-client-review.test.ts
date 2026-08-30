import { describe, expect, it } from 'vitest'
import type { BookingMasterView } from '@lumira/contracts'

import { canLeaveMasterClientReview } from '@/features/reviews/model/can-leave-master-client-review'

function booking(
  overrides: Partial<
    Pick<
      BookingMasterView,
      'status' | 'completedAt' | 'clientReview' | 'clientHasAccount'
    >
  >,
) {
  return {
    status: 'completed' as const,
    completedAt: '2026-08-01T12:00:00.000Z',
    clientReview: null,
    clientHasAccount: true,
    ...overrides,
  }
}

describe('canLeaveMasterClientReview', () => {
  const now = new Date('2026-08-10T12:00:00.000Z')

  it('allows a completed visit with a client account and no review yet', () => {
    expect(canLeaveMasterClientReview(booking({}), now)).toBe(true)
  })

  it('blocks a guest booking without an account', () => {
    expect(
      canLeaveMasterClientReview(booking({ clientHasAccount: false }), now),
    ).toBe(false)
  })

  it('skips the window when time guards are relaxed', () => {
    expect(
      canLeaveMasterClientReview(
        booking({}),
        new Date('2026-08-16T12:00:01.000Z'),
        { relaxTimeGuards: true },
      ),
    ).toBe(true)
  })

  it('blocks when the master already left a review', () => {
    expect(
      canLeaveMasterClientReview(
        booking({
          clientReview: {
            id: '11111111-1111-4111-8111-111111111111',
            status: 'published',
            rating: null,
          },
        }),
        now,
      ),
    ).toBe(false)
  })
})
