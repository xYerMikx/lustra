import type { MasterCalendarSlotView } from '@lumira/contracts'

export function pickUpcomingOpenSlots(
  slots: MasterCalendarSlotView[],
  nowMs: number,
  limit: number,
): MasterCalendarSlotView[] {
  return slots
    .filter((slot) => {
      if (slot.status !== 'open') {
        return false
      }

      return new Date(slot.startsAt).getTime() >= nowMs
    })
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    )
    .slice(0, limit)
}
