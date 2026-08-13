import { describe, expect, it } from 'vitest'

import { resolveCreateReview } from '@/modules/reviews/domain/review-eligibility'

const completedAt = new Date('2026-08-01T12:00:00.000Z')

describe('resolveCreateReview', () => {
  it('allows a review within 14 days of completion', () => {
    expect(
      resolveCreateReview({
        status: 'completed',
        completedAt,
        hasReview: false,
        now: new Date('2026-08-10T12:00:00.000Z'),
      }),
    ).toEqual({ ok: true })
  })

  it('rejects a second review for the same booking', () => {
    expect(
      resolveCreateReview({
        status: 'completed',
        completedAt,
        hasReview: true,
        now: new Date('2026-08-10T12:00:00.000Z'),
      }),
    ).toEqual({ ok: false, reason: 'already_reviewed' })
  })

  it('rejects reviews without a completed booking', () => {
    expect(
      resolveCreateReview({
        status: 'confirmed',
        completedAt: null,
        hasReview: false,
        now: new Date('2026-08-10T12:00:00.000Z'),
      }),
    ).toEqual({ ok: false, reason: 'not_completed' })
  })

  it('rejects reviews after the 14-day window', () => {
    expect(
      resolveCreateReview({
        status: 'completed',
        completedAt,
        hasReview: false,
        now: new Date('2026-08-16T12:00:01.000Z'),
      }),
    ).toEqual({ ok: false, reason: 'window_closed' })
  })
})
