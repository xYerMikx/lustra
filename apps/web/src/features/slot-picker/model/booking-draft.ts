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

export const BOOKING_DRAFT_KEY = 'lumira.bookingDraft'

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

export function readBookingDraft(): BookingDraft | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.sessionStorage.getItem(BOOKING_DRAFT_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<BookingDraft>

    if (
      typeof parsed.masterId !== 'string' ||
      typeof parsed.masterSlug !== 'string' ||
      typeof parsed.serviceId !== 'string' ||
      typeof parsed.startsAt !== 'string'
    ) {
      return null
    }

    return {
      masterId: parsed.masterId,
      masterSlug: parsed.masterSlug,
      serviceId: parsed.serviceId,
      startsAt: parsed.startsAt,
    }
  } catch {
    return null
  }
}

export function clearBookingDraft(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(BOOKING_DRAFT_KEY)
}

export function buildHoldIdempotencyKey(input: {
  masterId: string
  serviceId: string
  startsAt: string
}): string {
  return `hold:${input.masterId}:${input.serviceId}:${input.startsAt}`
}
