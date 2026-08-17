import type { BookingStatus } from '@lustra/contracts'

const NO_SHOWABLE = new Set<BookingStatus>(['pending', 'confirmed'])

export function canMarkNoShow(status: BookingStatus): boolean {
  return NO_SHOWABLE.has(status)
}
