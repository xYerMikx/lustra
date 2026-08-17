'use client'

import type { MasterCalendarSlotView } from '@lustra/contracts'

import {
  calendarSlotLabel,
  isOpenCalendarSlot,
} from '@/features/master-calendar/model/calendar-slot-label'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { formatTimeInTimeZone } from '@/shared/lib/tz'

type DaySlotChipProps = {
  slot: MasterCalendarSlotView
  onSelect: (startsAtIso: string) => void
}

export function DaySlotChip({ slot, onSelect }: DaySlotChipProps) {
  const timeLabel = formatTimeInTimeZone(new Date(slot.startsAt))
  const label = calendarSlotLabel(slot, timeLabel)

  if (isOpenCalendarSlot(slot)) {
    return (
      <button
        type="button"
        className={styles.slotChip}
        data-status={slot.status}
        onClick={() => onSelect(slot.startsAt)}
      >
        {label}
      </button>
    )
  }

  return (
    <span className={styles.slotChip} data-status={slot.status}>
      {label}
    </span>
  )
}
