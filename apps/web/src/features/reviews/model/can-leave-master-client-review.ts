import { REVIEW_WINDOW_DAYS } from '@lustra/contracts'
import type { BookingMasterView } from '@lustra/contracts'

const DAY_MS = 24 * 60 * 60 * 1000

export function canLeaveMasterClientReview(
  booking: Pick<
    BookingMasterView,
    'status' | 'completedAt' | 'clientReview' | 'clientHasAccount'
  >,
  now: Date,
  options?: { relaxTimeGuards?: boolean },
): boolean {
  if (
    booking.status !== 'completed' ||
    booking.clientReview ||
    !booking.completedAt ||
    !booking.clientHasAccount
  ) {
    return false
  }

  if (options?.relaxTimeGuards) {
    return true
  }

  const elapsed = now.getTime() - new Date(booking.completedAt).getTime()

  return elapsed >= 0 && elapsed <= REVIEW_WINDOW_DAYS * DAY_MS
}
