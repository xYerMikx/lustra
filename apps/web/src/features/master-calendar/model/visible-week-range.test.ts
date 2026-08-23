import { describe, expect, it } from 'vitest'

import { visibleWeekRange } from '@/features/master-calendar/model/visible-week-range'

describe('visibleWeekRange', () => {
  const dates = ['2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27']

  it('returns the first visible window at scroll start', () => {
    expect(visibleWeekRange(dates, 0, 220, 2)).toEqual({
      from: '2026-08-24',
      to: '2026-08-25',
    })
  })

  it('advances the window after scrolling one card', () => {
    expect(visibleWeekRange(dates, 220, 220, 2)).toEqual({
      from: '2026-08-25',
      to: '2026-08-26',
    })
  })

  it('clamps to the last cards at the end of the track', () => {
    expect(visibleWeekRange(dates, 10_000, 220, 3)).toEqual({
      from: '2026-08-27',
      to: '2026-08-27',
    })
  })
})
