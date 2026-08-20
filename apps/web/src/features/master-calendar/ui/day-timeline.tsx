'use client'

import type {
  MasterCalendarSlotView,
  ScheduleExceptionView,
  TimeBlockView,
} from '@lustra/contracts'

import { exceptionSummary } from '@/features/master-calendar/model/exception-summary'
import { blockOverlapsHour } from '@/features/master-calendar/model/group-calendar'
import {
  mergeSlotSpans,
  spansForHour,
} from '@/features/master-calendar/model/merge-slot-spans'
import { DaySpanChip } from '@/features/master-calendar/ui/day-span-chip'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { ConfirmPopover } from '@/shared/ui/confirm-popover'
import { TrashIcon } from '@/shared/ui/icon-pack'
import {
  MASTER_TIMEZONE,
  formatTimeInTimeZone,
  zonedLocalToUtc,
} from '@/shared/lib/tz'

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
  slots: MasterCalendarSlotView[]
  blocks: TimeBlockView[]
  exception: ScheduleExceptionView | null
  calendarPath: string
  canBook: boolean
  onSelectSlot: (startsAtIso: string) => void
  onRemoveBlock: (blockId: string) => void
  onRemoveException: (ymdDate: string) => void
}

export function DayTimeline({
  date,
  slots,
  blocks,
  exception,
  calendarPath,
  canBook,
  onSelectSlot,
  onRemoveBlock,
  onRemoveException,
}: DayTimelineProps) {
  const spans = mergeSlotSpans(slots)

  return (
    <div className={styles.timeline} role="list">
      {exception ? (
        <div className={styles.exceptionRow}>
          <span className={styles.exceptionBanner}>
            {exceptionSummary(exception)}
            {exception.note ? ` · ${exception.note}` : ''}
          </span>
          <ConfirmPopover
            title="Снять исключение на этот день?"
            confirmLabel="Снять"
            trigger={<TrashIcon />}
            triggerLabel="Снять исключение"
            onConfirm={() => onRemoveException(exception.date)}
          />
        </div>
      ) : null}
      {HOURS.map((hour) => {
        const hourStart = zonedLocalToUtc(date, hour * 60, MASTER_TIMEZONE)
        const hourEnd = zonedLocalToUtc(date, hour * 60 + 60, MASTER_TIMEZONE)
        const hourSpans = spansForHour(
          spans,
          hourStart.toISOString(),
          hourEnd.toISOString(),
        )
        const hourBlocks = blocks.filter((block) =>
          blockOverlapsHour(block, date, hour),
        )

        return (
          <div key={hour} className={styles.hourRow} role="listitem">
            <div className={styles.hourLabel}>
              {String(hour).padStart(2, '0')}:00
            </div>
            <div className={styles.hourCell}>
              {hourSpans.map((span) => (
                <DaySpanChip
                  key={span.id}
                  span={span}
                  calendarPath={calendarPath}
                  canBook={canBook}
                  onSelectOpen={onSelectSlot}
                />
              ))}
              {hourBlocks.map((block) => (
                <div key={`${block.id}-${hour}`} className={styles.blockRow}>
                  <span className={styles.blockChip}>
                    {REASON_LABELS[block.reason]} ·{' '}
                    {formatTimeInTimeZone(new Date(block.startsAt))}–
                    {formatTimeInTimeZone(new Date(block.endsAt))}
                  </span>
                  {blockOverlapsHour(block, date, hour - 1) ? null : (
                    <ConfirmPopover
                      title="Снять этот блок?"
                      confirmLabel="Снять"
                      trigger={<TrashIcon />}
                      triggerLabel="Снять блок"
                      onConfirm={() => onRemoveBlock(block.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
