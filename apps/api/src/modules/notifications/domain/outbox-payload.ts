export type OutboxBookingPayload = {
  bookingId: string
}

export function readOutboxBookingId(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) {
    return null
  }

  if (!('bookingId' in payload)) {
    return null
  }

  const bookingId = payload.bookingId

  if (typeof bookingId !== 'string' || bookingId.length === 0) {
    return null
  }

  return bookingId
}

export const OUTBOX_SCHEDULE_REMINDER_TYPES = [
  'booking.created',
  'booking.created_manual',
  'booking.confirmed',
] as const

export function shouldScheduleReminders(type: string): boolean {
  return (OUTBOX_SCHEDULE_REMINDER_TYPES as readonly string[]).includes(type)
}
