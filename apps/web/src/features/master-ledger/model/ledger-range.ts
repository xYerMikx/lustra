import type { LedgerPeriodPreset } from '@lustra/contracts'

import {
  addDaysToYmdDate,
  formatYmdDateInTimeZone,
} from '@/shared/lib/tz'

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function startOfIsoWeek(ymd: string): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const utc = new Date(Date.UTC(year!, month! - 1, day!))
  const iso = utc.getUTCDay() === 0 ? 7 : utc.getUTCDay()

  return addDaysToYmdDate(ymd, 1 - iso)
}

function endOfMonth(ymd: string): string {
  const [year, month] = ymd.split('-').map(Number)
  const last = new Date(Date.UTC(year!, month!, 0)).getUTCDate()

  return `${ymd.slice(0, 7)}-${pad2(last)}`
}

export function ledgerRangeForPreset(
  preset: LedgerPeriodPreset,
  now: Date,
): { from: string; to: string } {
  const today = formatYmdDateInTimeZone(now)

  if (preset === 'week') {
    const from = startOfIsoWeek(today)

    return { from, to: addDaysToYmdDate(from, 6) }
  }

  if (preset === 'two_weeks') {
    const weekStart = startOfIsoWeek(today)

    return { from: addDaysToYmdDate(weekStart, -7), to: addDaysToYmdDate(weekStart, 6) }
  }

  return { from: `${today.slice(0, 7)}-01`, to: endOfMonth(today) }
}

export function detectLedgerPreset(
  from: string,
  to: string,
  now: Date,
): LedgerPeriodPreset | null {
  const presets: LedgerPeriodPreset[] = ['week', 'two_weeks', 'month']

  for (const preset of presets) {
    const range = ledgerRangeForPreset(preset, now)

    if (range.from === from && range.to === to) {
      return preset
    }
  }

  return null
}
