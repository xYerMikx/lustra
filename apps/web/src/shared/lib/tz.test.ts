import { describe, expect, it } from 'vitest'

import {
  addDaysToYmdDate,
  endOfYmdMonth,
  ymdToUtcDate,
} from '@/shared/lib/tz'

describe('ymdToUtcDate', () => {
  it('parses a calendar day as UTC midnight', () => {
    expect(ymdToUtcDate('2026-08-18').toISOString()).toBe(
      '2026-08-18T00:00:00.000Z',
    )
  })

  it('rejects a non-YMD value', () => {
    expect(() => ymdToUtcDate('18.08.2026')).toThrow(RangeError)
  })
})

describe('addDaysToYmdDate', () => {
  it('rolls into the next month', () => {
    expect(addDaysToYmdDate('2026-08-31', 1)).toBe('2026-09-01')
  })
})

describe('endOfYmdMonth', () => {
  it('returns the last calendar day of the month', () => {
    expect(endOfYmdMonth('2026-02-10')).toBe('2026-02-28')
    expect(endOfYmdMonth('2024-02-01')).toBe('2024-02-29')
  })
})
