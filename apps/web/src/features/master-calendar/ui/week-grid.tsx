'use client'

import cn from 'classnames'

import { todayYmdDate } from '@/features/master-calendar/model/calendar-range'
import { exceptionSummary } from '@/features/master-calendar/model/exception-summary'
import type { DayItems } from '@/features/master-calendar/model/group-calendar'
import { dateLabel } from '@/features/master-calendar/model/group-calendar'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

type WeekGridProps = {
  days: DayItems[]
  onSelectDay: (ymdDate: string) => void
}

export function WeekGrid({ days, onSelectDay }: WeekGridProps) {
  const today = todayYmdDate()

  return (
    <div className={styles.weekGrid}>
      {days.map((day) => (
        <button
          key={day.date}
          type="button"
          className={cn(
            styles.weekDay,
            day.date === today && styles.weekDayToday,
          )}
          onClick={() => onSelectDay(day.date)}
        >
          <span className={styles.weekDayTitle}>{dateLabel(day.date)}</span>
          <span className={styles.weekMeta}>
            свободно: {day.openSlots.length}
          </span>
          {day.exception ? (
            <span
              className={styles.exceptionChip}
              data-testid={TEST_ID.calendarExceptionChip}
            >
              {exceptionSummary(day.exception)}
            </span>
          ) : null}
          {day.blocks.length > 0 ? (
            <div className={styles.weekBlocks}>
              {day.blocks.map((block) => (
                <span
                  key={block.id}
                  className={styles.blockChip}
                  data-testid={TEST_ID.calendarBlockChip}
                >
                  блок
                </span>
              ))}
            </div>
          ) : null}
        </button>
      ))}
    </div>
  )
}
