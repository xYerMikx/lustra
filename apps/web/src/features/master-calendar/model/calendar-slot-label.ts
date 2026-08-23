import type { MasterCalendarSlotView } from '@lustra/contracts'

import { extraPaySuffix } from '@/shared/lib/money'

const STATUS_LABEL: Record<MasterCalendarSlotView['status'], string | null> = {
  open: null,
  held: 'холд',
  booked: null,
  blocked: 'блок',
  closed: 'скрыт',
}

export function calendarSlotLabel(
  slot: MasterCalendarSlotView,
  timeLabel: string,
): string {
  if (slot.status === 'booked' && slot.clientName) {
    return `${timeLabel} · ${slot.clientName}`
  }

  const statusLabel = STATUS_LABEL[slot.status]

  if (statusLabel) {
    return `${timeLabel} · ${statusLabel}`
  }

  if (slot.status === 'booked') {
    return `${timeLabel} · запись`
  }

  return `${timeLabel}${extraPaySuffix(slot.extraPayAmount)}`
}

export function isOpenCalendarSlot(slot: MasterCalendarSlotView): boolean {
  return slot.status === 'open'
}
