import type { MasterCalendarSlotView } from '@lumira/contracts'

export function bookedVisitCount(slots: MasterCalendarSlotView[]): number {
  const ids = new Set<string>()
  let unnamed = 0

  for (const slot of slots) {
    if (slot.status !== 'booked' && slot.status !== 'held') {
      continue
    }

    if (slot.bookingId) {
      ids.add(slot.bookingId)

      continue
    }

    unnamed += 1
  }

  return ids.size + unnamed
}
