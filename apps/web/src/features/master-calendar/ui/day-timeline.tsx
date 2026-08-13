'use client'

import type {
  MasterCalendarSlotView,
  ScheduleExceptionView,
  TimeBlockView,
} from '@lustra/contracts'

import { exceptionSummary } from '@/features/master-calendar/model/exception-summary'
import {
  blockOverlapsHour,
  slotsForHour,
} from '@/features/master-calendar/model/group-calendar'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { formatTimeInTimeZone } from '@/shared/lib/tz'

const HOURS = Array.from({ length: 15 }, (_, index) => index + 8)

const REASON_LABELS: Record<TimeBlockView['reason'], string> = {
  break: 'Перерыв',
  lunch: 'Обед',
  personal: 'Личное',
  vacation: 'Отпуск',
  sick: 'Болезнь',
  travel: 'Поездка',
  other: 'Блок',
}

type DayTimelineProps = {
  date: string
  openSlots: MasterCalendarSlotView[]
  blocks: TimeBlockView[]
  exception: ScheduleExceptionView | null
  onSelectSlot: (startsAtIso: string) => void
  onRemoveBlock: (blockId: string) => void
  onRemoveException: (ymdDate: string) => void
}

export function DayTimeline({
  date,
  openSlots,
  blocks,
  exception,
  onSelectSlot,
  onRemoveBlock,
  onRemoveException,
}: DayTimelineProps) {
  return (
    <div className={styles.timeline} role="list">
      {exception ? (
        <button
          type="button"
          className={styles.exceptionBanner}
          onClick={() => onRemoveException(exception.date)}
          title="Снять исключение"
        >
          {exceptionSummary(exception)}
          {exception.note ? ` · ${exception.note}` : ''}
        </button>
      ) : null}
      {HOURS.map((hour) => {
        const hourSlots = slotsForHour(openSlots, date, hour)
        const hourBlocks = blocks.filter((block) =>
          blockOverlapsHour(block, date, hour),
        )

        return (
          <div key={hour} className={styles.hourRow} role="listitem">
            <div className={styles.hourLabel}>
              {String(hour).padStart(2, '0')}:00
            </div>
            <div className={styles.hourCell}>
              {hourSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  className={styles.slotChip}
                  onClick={() => onSelectSlot(slot.startsAt)}
                >
                  {formatTimeInTimeZone(new Date(slot.startsAt))}
                </button>
              ))}
              {hourBlocks.map((block) => (
                <button
                  key={`${block.id}-${hour}`}
                  type="button"
                  className={styles.blockChip}
                  onClick={() => onRemoveBlock(block.id)}
                  title="Снять блок"
                >
                  {REASON_LABELS[block.reason]} ·{' '}
                  {formatTimeInTimeZone(new Date(block.startsAt))}–
                  {formatTimeInTimeZone(new Date(block.endsAt))}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
