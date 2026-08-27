import { endOfYmdMonth, ymdToUtcDate } from '@/shared/lib/tz'

function isFullCalendarMonth(from: string, to: string): boolean {
  if (!from.endsWith('-01')) {
    return false
  }

  if (from.slice(0, 7) !== to.slice(0, 7)) {
    return false
  }

  return to === endOfYmdMonth(from)
}

export function formatLedgerPeriodLabel(from: string, to: string): string {
  const fromDate = ymdToUtcDate(from)
  const toDate = ymdToUtcDate(to)
  const dayMonth = new Intl.DateTimeFormat('ru-BY', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })

  if (from === to) {
    return dayMonth.format(fromDate)
  }

  if (isFullCalendarMonth(from, to)) {
    return new Intl.DateTimeFormat('ru-BY', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(fromDate)
  }

  if (from.slice(0, 7) === to.slice(0, 7)) {
    return `${Number(from.slice(8))}–${dayMonth.format(toDate)}`
  }

  return `${dayMonth.format(fromDate)} — ${dayMonth.format(toDate)}`
}
