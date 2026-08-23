'use client'

import { useEffect } from 'react'
import cn from 'classnames'

import { bookedVisitCount } from '@/features/master-calendar/model/booked-visit-count'
import { todayYmdDate } from '@/features/master-calendar/model/calendar-range'
import { exceptionSummary } from '@/features/master-calendar/model/exception-summary'
import {
  dateLabel,
  openSlotCount,
  type DayItems,
} from '@/features/master-calendar/model/group-calendar'
import { useWeekCarousel } from '@/features/master-calendar/model/use-week-carousel'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { Button } from '@/shared/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/ui/icon-pack'
import { TEST_ID } from '@/shared/lib/test-id'

type WeekGridProps = {
  days: DayItems[]
  todayTick: number
  onSelectDay: (ymdDate: string) => void
  onVisibleRangeChange: (range: { from: string; to: string }) => void
}

export function WeekGrid({
  days,
  todayTick,
  onSelectDay,
  onVisibleRangeChange,
}: WeekGridProps) {
  const today = todayYmdDate()
  const dates = days.map((day) => day.date)
  const fromDate = dates[0] ?? ''
  const { viewportRef, visibleRange, scrollByCards, scrollToDate } =
    useWeekCarousel(dates)

  useEffect(() => {
    if (!fromDate) {
      return
    }

    scrollToDate(today)
  }, [today, todayTick, fromDate, scrollToDate])

  useEffect(() => {
    if (!visibleRange) {
      return
    }

    onVisibleRangeChange(visibleRange)
  }, [visibleRange, onVisibleRangeChange])

  return (
    <div className={styles.weekWrap}>
      <p className={styles.weekHint}>Листайте дни стрелками или свайпом</p>
      <div className={styles.weekCarousel}>
        <Button
          type="button"
          variant="icon"
          className={styles.weekArrow}
          aria-label="Предыдущие дни"
          data-testid={TEST_ID.calendarStripPrev}
          onClick={() => scrollByCards(-1)}
        >
          <ChevronLeftIcon />
        </Button>
        <div ref={viewportRef} className={styles.weekTrack}>
          {days.map((day) => {
            const isPast = day.date < today
            const booked = bookedVisitCount(day.slots)

            return (
              <button
                key={day.date}
                type="button"
                data-week-card=""
                data-date={day.date}
                className={cn(
                  styles.weekDay,
                  day.date === today && styles.weekDayToday,
                  isPast && styles.weekDayPast,
                )}
                onClick={() => onSelectDay(day.date)}
              >
                <span className={styles.weekDayHead}>
                  <span className={styles.weekDayTitle}>
                    {dateLabel(day.date)}
                  </span>
                </span>
                <span className={styles.weekMeta}>записи: {booked}</span>
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
        <Button
          type="button"
          variant="icon"
          className={styles.weekArrow}
          aria-label="Следующие дни"
          data-testid={TEST_ID.calendarStripNext}
          onClick={() => scrollByCards(1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}
