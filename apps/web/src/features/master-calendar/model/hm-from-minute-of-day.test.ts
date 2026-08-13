import { describe, expect, it } from 'vitest'

import { hmFromMinuteOfDay } from '@/features/master-calendar/model/hm-from-minute-of-day'

describe('hmFromMinuteOfDay', () => {
  it('formats minutes of day as HH:MM', () => {
    expect(hmFromMinuteOfDay(0)).toBe('00:00')
    expect(hmFromMinuteOfDay(630)).toBe('10:30')
    expect(hmFromMinuteOfDay(1440)).toBe('24:00')
  })
})
