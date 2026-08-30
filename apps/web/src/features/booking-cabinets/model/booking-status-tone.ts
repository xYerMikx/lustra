import type { BookingStatus } from '@lumira/contracts'

export type BookingStatusTone = 'hold' | 'confirmed' | 'done' | 'muted' | 'alert'

const TONES: Record<BookingStatus, BookingStatusTone> = {
  hold: 'hold',
  pending: 'hold',
  confirmed: 'confirmed',
  completed: 'done',
  cancelled_by_client: 'muted',
  cancelled_by_master: 'muted',
  expired: 'muted',
  no_show: 'alert',
}

export function bookingStatusTone(status: BookingStatus): BookingStatusTone {
  return TONES[status]
}
