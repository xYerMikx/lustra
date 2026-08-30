import type {
  MasterCalendarSlotView,
  MasterCalendarView,
  ScheduleExceptionView,
  TimeBlockView,
} from '@lumira/contracts'

import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  zonedLocalToUtc,
} from '@/shared/lib/tz'

export type DayItems = {
  date: string
  slots: MasterCalendarSlotView[]
  blocks: TimeBlockView[]
  exception: ScheduleExceptionView | null
}

export function groupCalendarByDay(
  data: MasterCalendarView,
  from: string,
  to: string,
): DayItems[] {
  const days: DayItems[] = []
  let cursor = from

  while (cursor <= to) {
    const dayStart = zonedLocalToUtc(cursor, 0, MASTER_TIMEZONE)
    const dayEnd = zonedLocalToUtc(addDaysToYmdDate(cursor, 1), 0, MASTER_TIMEZONE)

    days.push({
      date: cursor,
      slots: data.slots.filter((slot) => {
        const startsAt = new Date(slot.startsAt)

        return startsAt >= dayStart && startsAt < dayEnd
      }),
      blocks: data.blocks.filter((block) => {
        const startsAt = new Date(block.startsAt)
        const endsAt = new Date(block.endsAt)

        return startsAt < dayEnd && endsAt > dayStart
      }),
      exception:
        data.exceptions.find((item) => item.date === cursor) ?? null,
    })

    cursor = addDaysToYmdDate(cursor, 1)
  }

  return days
}

export function slotsForHour(
  slots: MasterCalendarSlotView[],
  ymdDate: string,
  hour: number,
): MasterCalendarSlotView[] {
  const hourStart = zonedLocalToUtc(ymdDate, hour * 60, MASTER_TIMEZONE)
  const hourEnd = zonedLocalToUtc(ymdDate, hour * 60 + 60, MASTER_TIMEZONE)

  return slots.filter((slot) => {
    const startsAt = new Date(slot.startsAt)

    return startsAt >= hourStart && startsAt < hourEnd
  })
}

export function blockOverlapsHour(
  block: TimeBlockView,
  ymdDate: string,
  hour: number,
): boolean {
  const hourStart = zonedLocalToUtc(ymdDate, hour * 60, MASTER_TIMEZONE)
  const hourEnd = zonedLocalToUtc(ymdDate, hour * 60 + 60, MASTER_TIMEZONE)
  const startsAt = new Date(block.startsAt)
  const endsAt = new Date(block.endsAt)

  return startsAt < hourEnd && endsAt > hourStart
}

export function dateLabel(ymdDate: string): string {
  const instant = zonedLocalToUtc(ymdDate, 12 * 60, MASTER_TIMEZONE)

  return new Intl.DateTimeFormat('ru-BY', {
    timeZone: MASTER_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(instant)
}

export function openSlotCount(slots: MasterCalendarSlotView[]): number {
  return slots.filter((slot) => slot.status === 'open').length
}
