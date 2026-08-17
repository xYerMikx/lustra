import { describe, expect, it } from 'vitest'

import { minuteOfDayFromHm } from '@/features/master-calendar/model/minute-of-day-from-hm'

describe('minuteOfDayFromHm', () => {
  it('parses HH:MM', () => {
    expect(minuteOfDayFromHm('00:00')).toBe(0)
    expect(minuteOfDayFromHm('10:30')).toBe(630)
    expect(minuteOfDayFromHm('23:59')).toBe(23 * 60 + 59)
  })

  it('rejects invalid values', () => {
    expect(minuteOfDayFromHm('9:00')).toBeNull()
    expect(minuteOfDayFromHm('24:00')).toBeNull()
    expect(minuteOfDayFromHm('12:60')).toBeNull()
  })
})
