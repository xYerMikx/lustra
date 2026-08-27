function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function ymdToUtcDate(ymd: string): Date {
  const [year, month, day] = ymd.split('-').map(Number)

  return new Date(Date.UTC(year!, month! - 1, day!))
}

function isFullCalendarMonth(from: string, to: string): boolean {
  if (!from.endsWith('-01')) {
    return false
  }

  if (from.slice(0, 7) !== to.slice(0, 7)) {
    return false
  }

  const [year, month] = from.split('-').map(Number)
  const last = new Date(Date.UTC(year!, month!, 0)).getUTCDate()

  return to === `${from.slice(0, 7)}-${pad2(last)}`
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
