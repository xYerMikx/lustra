'use client'

import cn from 'classnames'

import { bookedVisitCount } from '@/features/master-calendar/model/booked-visit-count'
import { todayYmdDate } from '@/features/master-calendar/model/calendar-range'
import { exceptionSummary } from '@/features/master-calendar/model/exception-summary'
import {
  dateLabel,
  openSlotCount,
  type DayItems,
} from '@/features/master-calendar/model/group-calendar'
import { ChevronRightIcon } from '@/shared/ui/icon-pack'
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
      {days.map((day) => {
        const isPast = day.date < today
        const booked = bookedVisitCount(day.slots)

        return (
          <button
            key={day.date}
            type="button"
            className={cn(
              styles.weekDay,
              day.date === today && styles.weekDayToday,
              isPast && styles.weekDayPast,
            )}
            onClick={() => onSelectDay(day.date)}
          >
            <span className={styles.weekDayHead}>
              <span className={styles.weekDayTitle}>{dateLabel(day.date)}</span>
              <span className={styles.weekDayHint}>
                <span className={styles.weekHintText}>
                  {isPast ? 'Прошедший день' : 'Открыть день'}
                </span>
                <ChevronRightIcon className={styles.weekHintIcon} />
              </span>
            </span>
            <span className={styles.weekMeta}>
              записи: {booked}
            </span>
            <span className={styles.weekMeta}>
              свободно: {openSlotCount(day.slots)}
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
        )
      })}
    </div>
  )
}
