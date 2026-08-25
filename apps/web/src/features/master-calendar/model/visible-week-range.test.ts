import { describe, expect, it } from 'vitest'

import {
  carouselPageStartIndex,
  scrollLeftForChild,
  visibleWeekRange,
} from '@/features/master-calendar/model/visible-week-range'

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

describe('carouselPageStartIndex', () => {
  const dates = [
    '2026-08-24',
    '2026-08-25',
    '2026-08-26',
    '2026-08-27',
    '2026-08-28',
    '2026-08-29',
    '2026-08-30',
    '2026-08-31',
  ]

  it('keeps Tuesday in the Monday page when four cards are visible', () => {
    expect(carouselPageStartIndex(dates, '2026-08-25', 4)).toBe(0)
  })

  it('opens the next page when today is the first card of that page', () => {
    expect(carouselPageStartIndex(dates, '2026-08-28', 4)).toBe(4)
  })

  it('scrolls to the date itself when only one card fits', () => {
    expect(carouselPageStartIndex(dates, '2026-08-25', 1)).toBe(1)
  })
})

describe('scrollLeftForChild', () => {
  it('uses the viewport, not offsetLeft of a positioned ancestor', () => {
    expect(scrollLeftForChild(0, 100, 100)).toBe(0)
    expect(scrollLeftForChild(0, 80, 308)).toBe(228)
  })

  it('rounds subpixels so scroll-snap does not skip a card', () => {
    expect(scrollLeftForChild(0, 80.4, 308.8)).toBe(228)
  })
})
