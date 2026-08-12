import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  formatYmdDateInTimeZone,
} from '@/shared/lib/tz'

export function todayYmdDate(now: Date = new Date()): string {
  return formatYmdDateInTimeZone(now, MASTER_TIMEZONE)
}

export function availabilityRangeFromToday(
  dayCount: number,
  now: Date = new Date(),
): { from: string; to: string } {
  const from = todayYmdDate(now)

  return {
    from,
    to: addDaysToYmdDate(from, Math.max(dayCount - 1, 0)),
  }
}

export const BOOKING_DRAFT_KEY = 'lustra.bookingDraft'

export type BookingDraft = {
  masterId: string
  masterSlug: string
  serviceId: string
  startsAt: string
}

export function saveBookingDraft(draft: BookingDraft): void {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft))
}
