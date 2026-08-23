import type {
  MasterCalendarSlotView,
  ScheduleExceptionView,
} from '@lustra/contracts'

import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  formatYmdDateInTimeZone,
} from '@/shared/lib/tz'

export type UpcomingBookingsPick = {
  ymdDate: string
  isToday: boolean
  slots: MasterCalendarSlotView[]
}

function ymdOf(iso: string): string {
  return formatYmdDateInTimeZone(new Date(iso), MASTER_TIMEZONE)
}

function isDayOff(
  ymdDate: string,
  exceptions: ScheduleExceptionView[],
): boolean {
  return exceptions.some(
    (item) => item.date === ymdDate && item.type === 'day_off',
  )
}

function isWorkingDay(
  ymdDate: string,
  slots: MasterCalendarSlotView[],
  exceptions: ScheduleExceptionView[],
): boolean {
  if (isDayOff(ymdDate, exceptions)) {
    return false
  }

  const daySlots = slots.filter(
    (slot) => ymdOf(slot.startsAt) === ymdDate && slot.status !== 'closed',
  )

  if (daySlots.length === 0) {
    return false
  }

  const hasVisit = daySlots.some(
    (slot) => slot.status === 'booked' || slot.status === 'held',
  )
  const allBlocked = daySlots.every((slot) => slot.status === 'blocked')

  return hasVisit || !allBlocked
}

function dayEnded(
  ymdDate: string,
  slots: MasterCalendarSlotView[],
  nowMs: number,
): boolean {
  const daySlots = slots.filter(
    (slot) => ymdOf(slot.startsAt) === ymdDate && slot.status !== 'closed',
  )

  if (daySlots.length === 0) {
    return true
  }

  const lastEnd = Math.max(
    ...daySlots.map((slot) => new Date(slot.endsAt).getTime()),
  )

  return nowMs >= lastEnd
}

function visitsOnDay(
  ymdDate: string,
  slots: MasterCalendarSlotView[],
  nowMs: number,
  includePast: boolean,
): MasterCalendarSlotView[] {
  return slots
    .filter((slot) => {
      if (ymdOf(slot.startsAt) !== ymdDate) {
        return false
      }

      if (slot.status !== 'booked' && slot.status !== 'held') {
        return false
      }

      if (!includePast && new Date(slot.startsAt).getTime() < nowMs) {
        return false
      }

      return true
    })
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    )
}

export function pickUpcomingBookings(
  slots: MasterCalendarSlotView[],
  exceptions: ScheduleExceptionView[],
  nowMs: number,
  horizonDays = 14,
): UpcomingBookingsPick | null {
  const today = formatYmdDateInTimeZone(new Date(nowMs), MASTER_TIMEZONE)
  const todayWorking = isWorkingDay(today, slots, exceptions)
  const showToday =
    todayWorking && !dayEnded(today, slots, nowMs)

  if (showToday) {
    return {
      ymdDate: today,
      isToday: true,
      slots: visitsOnDay(today, slots, nowMs, false),
    }
  }

  for (let offset = 1; offset <= horizonDays; offset += 1) {
    const ymdDate = addDaysToYmdDate(today, offset)

    if (!isWorkingDay(ymdDate, slots, exceptions)) {
      continue
    }

    return {
      ymdDate,
      isToday: false,
      slots: visitsOnDay(ymdDate, slots, nowMs, true),
    }
  }

  return null
}
