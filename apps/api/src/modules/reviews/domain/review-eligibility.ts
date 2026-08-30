import { REVIEW_WINDOW_DAYS } from '@lumira/contracts'
import type { BookingStatus } from '@lumira/contracts'

const DAY_MS = 24 * 60 * 60 * 1000

export type CreateReviewEligibility =
  | { ok: true }
  | {
      ok: false
      reason: 'not_completed' | 'already_reviewed' | 'window_closed'
    }

export function resolveCreateReview(input: {
  status: BookingStatus
  completedAt: Date | null
  hasReview: boolean
  now: Date
  relaxTimeGuards?: boolean
}): CreateReviewEligibility {
  if (input.hasReview) {
    return { ok: false, reason: 'already_reviewed' }
  }

  if (input.status !== 'completed' || !input.completedAt) {
    return { ok: false, reason: 'not_completed' }
  }

  if (input.relaxTimeGuards) {
    return { ok: true }
  }

  const elapsed = input.now.getTime() - input.completedAt.getTime()

  if (elapsed < 0 || elapsed > REVIEW_WINDOW_DAYS * DAY_MS) {
    return { ok: false, reason: 'window_closed' }
  }

  return { ok: true }
}
