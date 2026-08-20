'use client'

import type { DayItems } from '@/features/master-calendar/model/group-calendar'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { DayTimeline } from '@/features/master-calendar/ui/day-timeline'
import { WeekGrid } from '@/features/master-calendar/ui/week-grid'

export type CalendarGridProps = {
  mode: 'day' | 'week'
  days: DayItems[]
  calendarPath: string
  canBook: boolean
  onSelectDay: (ymdDate: string) => void
  onSelectSlot: (startsAtIso: string) => void
  onRemoveBlock: (blockId: string) => void
  onRemoveException: (ymdDate: string) => void
}

export function CalendarGrid({
  mode,
  days,
  calendarPath,
  canBook,
  onSelectDay,
  onSelectSlot,
  onRemoveBlock,
  onRemoveException,
}: CalendarGridProps) {
  if (mode === 'week') {
    return <WeekGrid days={days} onSelectDay={onSelectDay} />
  }

  const dayView = days[0]

  if (!dayView) {
    return null
  }

  return (
    <DayTimeline
      date={dayView.date}
      slots={dayView.slots}
      blocks={dayView.blocks}
      exception={dayView.exception}
      calendarPath={calendarPath}
      canBook={canBook}
      onSelectSlot={onSelectSlot}
      onRemoveBlock={onRemoveBlock}
      onRemoveException={onRemoveException}
    />
  )
}
