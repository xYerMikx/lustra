import { REVIEW_WINDOW_DAYS } from '@lumira/contracts'
import type { BookingClientView } from '@lumira/contracts'

const DAY_MS = 24 * 60 * 60 * 1000

export function canLeaveReview(
  booking: Pick<BookingClientView, 'status' | 'completedAt' | 'review'>,
  now: Date,
  options?: { relaxTimeGuards?: boolean },
): boolean {
  if (booking.status !== 'completed' || booking.review || !booking.completedAt) {
    return false
  }

  if (options?.relaxTimeGuards) {
    return true
  }

  const elapsed = now.getTime() - new Date(booking.completedAt).getTime()

  return elapsed >= 0 && elapsed <= REVIEW_WINDOW_DAYS * DAY_MS
}
