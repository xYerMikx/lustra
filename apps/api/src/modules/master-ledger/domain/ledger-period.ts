import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  formatYmdDateInTimeZone,
  isoWeekdayForYmdDate,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'

export type LedgerPeriodPreset = 'week' | 'two_weeks' | 'month'

export type DateRange = {
  from: string
  to: string
}

export function ymdInMinsk(instant: Date): string {
  return formatYmdDateInTimeZone(instant, MASTER_TIMEZONE)
}

export function startOfIsoWeek(ymd: string): string {
  const weekday = isoWeekdayForYmdDate(ymd, MASTER_TIMEZONE)

  return addDaysToYmdDate(ymd, 1 - weekday)
}

export function startOfMonth(ymd: string): string {
  return `${ymd.slice(0, 7)}-01`
}

export function endOfMonth(ymd: string): string {
  const [year, month] = ymd.split('-').map(Number)
  const last = new Date(Date.UTC(year!, month!, 0)).getUTCDate()

  return `${ymd.slice(0, 7)}-${String(last).padStart(2, '0')}`
}

export function resolveLedgerRange(
  now: Date,
  input: { from?: string; to?: string },
): DateRange {
  if (input.from && input.to) {
    if (input.from > input.to) {
      return { from: input.to, to: input.from }
    }

    return { from: input.from, to: input.to }
  }

  return rangeForPreset('month', now)
}

export function rangeForPreset(
  preset: LedgerPeriodPreset,
  now: Date,
): DateRange {
  const today = ymdInMinsk(now)

  if (preset === 'week') {
    const from = startOfIsoWeek(today)

    return { from, to: addDaysToYmdDate(from, 6) }
  }

  if (preset === 'two_weeks') {
    const weekStart = startOfIsoWeek(today)

    return {
      from: addDaysToYmdDate(weekStart, -7),
      to: addDaysToYmdDate(weekStart, 6),
    }
  }

  return { from: startOfMonth(today), to: endOfMonth(today) }
}

export function ymdToUtcDate(ymd: string): Date {
  return zonedLocalToUtc(ymd, 0, MASTER_TIMEZONE)
}

export function endOfYmdUtc(ymd: string): Date {
  return zonedLocalToUtc(addDaysToYmdDate(ymd, 1), 0, MASTER_TIMEZONE)
}
