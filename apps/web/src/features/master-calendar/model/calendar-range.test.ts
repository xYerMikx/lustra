import { describe, expect, it } from 'vitest'

import {
  rangeForMode,
  shiftAnchorDate,
  weekRangeForDate,
} from '@/features/master-calendar/model/calendar-range'

describe('calendar-range', () => {
  it('builds a Monday–Sunday week for a mid-week date', () => {
    // 2026-08-11 is Tuesday
    expect(weekRangeForDate('2026-08-11')).toEqual({
      from: '2026-08-10',
      to: '2026-08-16',
    })
  })

  it('shifts day and week anchors', () => {
    expect(shiftAnchorDate('2026-08-11', 'day', 1)).toBe('2026-08-12')
    expect(shiftAnchorDate('2026-08-11', 'week', -1)).toBe('2026-08-04')
  })

  it('returns day or week range for the mode', () => {
    expect(rangeForMode('2026-08-11', 'day')).toEqual({
      from: '2026-08-11',
      to: '2026-08-11',
    })
    expect(rangeForMode('2026-08-11', 'week')).toEqual({
      from: '2026-08-10',
      to: '2026-08-16',
    })
  })
})
