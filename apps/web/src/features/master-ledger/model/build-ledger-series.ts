import type { LedgerEntryView, LedgerKind } from '@lustra/contracts'

import { addDaysToYmdDate } from '@/shared/lib/tz'

export type LedgerChartPoint = {
  key: string
  label: string
  income: number
  expense: number
}

type LedgerSeriesItem = Pick<LedgerEntryView, 'kind' | 'amount' | 'occurredOn'>

const DAILY_THRESHOLD = 14

function enumerateYmd(from: string, to: string): string[] {
  const days: string[] = []
  let cursor = from

  while (cursor <= to) {
    days.push(cursor)
    cursor = addDaysToYmdDate(cursor, 1)
  }

  return days
}

function ymdToUtcDate(ymd: string): Date {
  const [year, month, day] = ymd.split('-').map(Number)

  return new Date(Date.UTC(year, month - 1, day))
}

function startOfIsoWeek(ymd: string): string {
  const utc = ymdToUtcDate(ymd)
  const iso = utc.getUTCDay() === 0 ? 7 : utc.getUTCDay()

  return addDaysToYmdDate(ymd, 1 - iso)
}

function formatWeekdayLabel(ymd: string): string {
  return new Intl.DateTimeFormat('ru-BY', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(ymdToUtcDate(ymd))
}

function formatDayNumber(ymd: string): string {
  return String(Number(ymd.slice(8)))
}

function formatWeekRangeLabel(from: string, to: string): string {
  const start = Number(from.slice(8))
  const endLabel = new Intl.DateTimeFormat('ru-BY', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(ymdToUtcDate(to))

  return `${start}–${endLabel}`
}

function totalsForDay(
  items: LedgerSeriesItem[],
  ymd: string,
): { income: number; expense: number } {
  let income = 0
  let expense = 0

  for (const item of items) {
    if (item.occurredOn !== ymd) {
      continue
    }

    const amount = Number(item.amount)

    if (!Number.isFinite(amount)) {
      continue
    }

    if (item.kind === 'income') {
      income += amount
    } else {
      expense += amount
    }
  }

  return { income, expense }
}

function buildDailySeries(
  items: LedgerSeriesItem[],
  days: string[],
): LedgerChartPoint[] {
  const useWeekday = days.length <= 7

  return days.map((ymd) => {
    const totals = totalsForDay(items, ymd)

    return {
      key: ymd,
      label: useWeekday ? formatWeekdayLabel(ymd) : formatDayNumber(ymd),
      income: totals.income,
      expense: totals.expense,
    }
  })
}

function buildWeeklySeries(
  items: LedgerSeriesItem[],
  days: string[],
): LedgerChartPoint[] {
  const buckets = new Map<string, { from: string; to: string; income: number; expense: number }>()

  for (const ymd of days) {
    const weekFrom = startOfIsoWeek(ymd)
    const current = buckets.get(weekFrom) ?? {
      from: weekFrom,
      to: ymd,
      income: 0,
      expense: 0,
    }
    const totals = totalsForDay(items, ymd)

    current.to = ymd
    current.income += totals.income
    current.expense += totals.expense
    buckets.set(weekFrom, current)
  }

  return [...buckets.values()].map((bucket) => ({
    key: bucket.from,
    label: formatWeekRangeLabel(bucket.from, bucket.to),
    income: bucket.income,
    expense: bucket.expense,
  }))
}

export function buildLedgerSeries(
  items: LedgerSeriesItem[],
  from: string,
  to: string,
): LedgerChartPoint[] {
  if (from > to) {
    return []
  }

  const days = enumerateYmd(from, to)

  if (days.length === 0) {
    return []
  }

  if (days.length <= DAILY_THRESHOLD) {
    return buildDailySeries(items, days)
  }

  return buildWeeklySeries(items, days)
}

export function ledgerSeriesMax(points: LedgerChartPoint[]): number {
  return points.reduce((max, point) => {
    return Math.max(max, point.income, point.expense)
  }, 0)
}

export function ledgerBarHeight(value: number, max: number, chartHeight: number): number {
  if (max <= 0 || value <= 0) {
    return 0
  }

  return (value / max) * chartHeight
}

export type LedgerBreakdownRow = {
  categoryName: string
  kind: LedgerKind
  amount: number
}

export function buildLedgerBreakdown(
  items: Array<Pick<LedgerEntryView, 'kind' | 'amount' | 'categoryName'>>,
  limit = 5,
): LedgerBreakdownRow[] {
  const totals = new Map<string, LedgerBreakdownRow>()

  for (const item of items) {
    const amount = Number(item.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      continue
    }

    const key = `${item.kind}:${item.categoryName}`
    const current = totals.get(key)

    if (current) {
      current.amount += amount
      continue
    }

    totals.set(key, {
      categoryName: item.categoryName,
      kind: item.kind,
      amount,
    })
  }

  return [...totals.values()]
    .sort((left, right) => right.amount - left.amount)
    .slice(0, limit)
}

export function breakdownTickCount(amount: number, max: number, ticks = 10): number {
  if (max <= 0 || amount <= 0) {
    return 0
  }

  return Math.max(1, Math.round((amount / max) * ticks))
}

export function isLedgerChartLabelVisible(index: number, total: number): boolean {
  if (total <= 8) {
    return true
  }

  if (index === 0 || index === total - 1) {
    return true
  }

  const step = Math.ceil(total / 6)

  return index % step === 0
}
