import type { LedgerPeriodPreset } from '@lumira/contracts'

import {
  addDaysToYmdDate,
  endOfYmdMonth,
  formatYmdDateInTimeZone,
  ymdToUtcDate,
} from '@/shared/lib/tz'

function startOfIsoWeek(ymd: string): string {
  const utc = ymdToUtcDate(ymd)
  const iso = utc.getUTCDay() === 0 ? 7 : utc.getUTCDay()

  return addDaysToYmdDate(ymd, 1 - iso)
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

  return { from: `${today.slice(0, 7)}-01`, to: endOfYmdMonth(today) }
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
