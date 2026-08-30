import type { BookingStatus } from '@lumira/contracts'

export function canRescheduleBooking(status: BookingStatus): boolean {

  return status === 'pending' || status === 'confirmed'
}
