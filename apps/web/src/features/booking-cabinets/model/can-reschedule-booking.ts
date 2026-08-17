import type { BookingStatus } from '@lustra/contracts'

export function canRescheduleBooking(status: BookingStatus): boolean {

  return status === 'pending' || status === 'confirmed'
}
