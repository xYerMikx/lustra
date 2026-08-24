import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  formatYmdDateInTimeZone,
} from '@/shared/lib/tz'

export type CalendarViewMode = 'day' | 'week'

const ISO_WEEKDAY_OFFSET: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
}

/** Monday-based week containing `ymdDate` (Europe/Minsk calendar day). */
export function weekRangeForDate(ymdDate: string): { from: string; to: string } {
  const noonUtc = new Date(`${ymdDate}T12:00:00.000Z`)
  const weekdayName = new Intl.DateTimeFormat('en-US', {
    timeZone: MASTER_TIMEZONE,
    weekday: 'short',
  }).format(noonUtc)

  const offset = ISO_WEEKDAY_OFFSET[weekdayName] ?? 0
  const from = addDaysToYmdDate(ymdDate, -offset)

  return {
    from,
    to: addDaysToYmdDate(from, 6),
  }
}

export function shiftAnchorDate(
  ymdDate: string,
  mode: CalendarViewMode,
  direction: -1 | 1,
): string {
  const delta = mode === 'day' ? direction : direction * 7

  return addDaysToYmdDate(ymdDate, delta)
}

export function eachYmdDate(from: string, to: string): string[] {
  const dates: string[] = []
  let cursor = from

  while (cursor <= to) {
    dates.push(cursor)
    cursor = addDaysToYmdDate(cursor, 1)
  }

  return dates
}

export function todayYmdDate(now: Date = new Date()): string {
  return formatYmdDateInTimeZone(now, MASTER_TIMEZONE)
}

export function rangeForMode(
  anchorYmdDate: string,
  mode: CalendarViewMode,
): { from: string; to: string } {
  if (mode === 'day') {
    return { from: anchorYmdDate, to: anchorYmdDate }
  }

  const week = weekRangeForDate(anchorYmdDate)

  return {
    from: week.from,
    to: addDaysToYmdDate(week.from, 20),
  }
}
