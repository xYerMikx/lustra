'use client'

import { useRouter } from 'next/navigation'

import {
  calendarSpanLabel,
  isOpenCalendarSpan,
} from '@/features/master-calendar/model/calendar-span-label'
import { bookingHrefFromCalendar } from '@/features/master-calendar/model/calendar-href'
import type { CalendarSpan } from '@/features/master-calendar/model/merge-slot-spans'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { formatTimeInTimeZone } from '@/shared/lib/tz'

type DaySpanChipProps = {
  span: CalendarSpan
  calendarPath: string
  canBook: boolean
  onSelectOpen: (startsAtIso: string) => void
}

export function DaySpanChip({
  span,
  calendarPath,
  canBook,
  onSelectOpen,
}: DaySpanChipProps) {
  const router = useRouter()
  const startLabel = formatTimeInTimeZone(new Date(span.startsAt))
  const endLabel = formatTimeInTimeZone(new Date(span.endsAt))
  const label = calendarSpanLabel(span, startLabel, endLabel)

  if (isOpenCalendarSpan(span)) {
    if (!canBook) {
      return (
        <span className={styles.slotChip} data-status={span.status}>
          {label}
        </span>
      )
    }

    return (
      <button
        type="button"
        className={styles.slotChip}
        data-status={span.status}
        onClick={() => onSelectOpen(span.startsAt)}
      >
        {label}
      </button>
    )
  }

  if (span.status === 'booked' && span.bookingId) {
    return (
      <button
        type="button"
        className={styles.spanChip}
        data-status={span.status}
        onClick={() => {
          router.push(bookingHrefFromCalendar(span.bookingId ?? '', calendarPath))
        }}
      >
        {label}
      </button>
    )
  }

  return (
    <span className={styles.spanChip} data-status={span.status}>
      {label}
    </span>
  )
}
