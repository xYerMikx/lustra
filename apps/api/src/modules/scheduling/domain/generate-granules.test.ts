import { describe, expect, it } from 'vitest'

import { generateGranuleStarts } from '@/modules/scheduling/domain/generate-granules'
import {
  MASTER_TIMEZONE,
  formatYmdInTimeZone,
  isoWeekdayForYmd,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'

describe('generateGranuleStarts', () => {
  const now = zonedLocalToUtc('2026-08-10', 9 * 60, MASTER_TIMEZONE)

  it('returns empty when there are no rules', () => {
    const starts = generateGranuleStarts({
      now,
      fromYmd: '2026-08-10',
      toYmd: '2026-08-12',
      granularityMin: 30,
      maxHorizonDays: 30,
      rules: [],
      exceptions: [],
      blocks: [],
    })

    expect(starts).toEqual([])
  })

  it('builds granules from weekday rules aligned to interval start', () => {
    // 2026-08-10 is Monday
    expect(isoWeekdayForYmd('2026-08-10', MASTER_TIMEZONE)).toBe(1)

    const starts = generateGranuleStarts({
      now,
      fromYmd: '2026-08-10',
      toYmd: '2026-08-10',
      granularityMin: 30,
      maxHorizonDays: 30,
      rules: [{ weekday: 1, startMin: 600, endMin: 720 }],
      exceptions: [],
      blocks: [],
    })

    expect(starts.map((item) => item.toISOString())).toEqual([
      zonedLocalToUtc('2026-08-10', 600, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 630, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 660, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 690, MASTER_TIMEZONE).toISOString(),
    ])
  })

  it('drops a tail shorter than granularity', () => {
    const starts = generateGranuleStarts({
      now,
      fromYmd: '2026-08-10',
      toYmd: '2026-08-10',
      granularityMin: 30,
      maxHorizonDays: 30,
      rules: [{ weekday: 1, startMin: 600, endMin: 650 }],
      exceptions: [],
      blocks: [],
    })

    expect(starts).toHaveLength(1)
    expect(starts[0]?.toISOString()).toBe(
      zonedLocalToUtc('2026-08-10', 600, MASTER_TIMEZONE).toISOString(),
    )
  })

  it('respects day_off exceptions', () => {
    const starts = generateGranuleStarts({
      now,
      fromYmd: '2026-08-10',
      toYmd: '2026-08-10',
      granularityMin: 30,
      maxHorizonDays: 30,
      rules: [{ weekday: 1, startMin: 600, endMin: 720 }],
      exceptions: [{ dateYmd: '2026-08-10', type: 'day_off' }],
      blocks: [],
    })

    expect(starts).toEqual([])
  })

  it('uses custom_hours exceptions instead of weekly rules', () => {
    const starts = generateGranuleStarts({
      now,
      fromYmd: '2026-08-10',
      toYmd: '2026-08-10',
      granularityMin: 30,
      maxHorizonDays: 30,
      rules: [{ weekday: 1, startMin: 600, endMin: 1200 }],
      exceptions: [
        {
          dateYmd: '2026-08-10',
          type: 'custom_hours',
          startMin: 660,
          endMin: 720,
        },
      ],
      blocks: [],
    })

    expect(starts.map((item) => item.toISOString())).toEqual([
      zonedLocalToUtc('2026-08-10', 660, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 690, MASTER_TIMEZONE).toISOString(),
    ])
  })

  it('subtracts lunch blocks from the working interval', () => {
    const starts = generateGranuleStarts({
      now,
      fromYmd: '2026-08-10',
      toYmd: '2026-08-10',
      granularityMin: 30,
      maxHorizonDays: 30,
      rules: [{ weekday: 1, startMin: 600, endMin: 780 }],
      exceptions: [],
      blocks: [
        {
          startsAt: zonedLocalToUtc('2026-08-10', 660, MASTER_TIMEZONE),
          endsAt: zonedLocalToUtc('2026-08-10', 720, MASTER_TIMEZONE),
        },
      ],
    })

    expect(starts.map((item) => item.toISOString())).toEqual([
      zonedLocalToUtc('2026-08-10', 600, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 630, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 720, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 750, MASTER_TIMEZONE).toISOString(),
    ])
  })

  it('clips range to horizon and today', () => {
    const starts = generateGranuleStarts({
      now,
      fromYmd: '2026-08-01',
      toYmd: '2026-09-30',
      granularityMin: 60,
      maxHorizonDays: 2,
      rules: [
        { weekday: 1, startMin: 600, endMin: 660 },
        { weekday: 2, startMin: 600, endMin: 660 },
        { weekday: 3, startMin: 600, endMin: 660 },
      ],
      exceptions: [],
      blocks: [],
    })

    const dates = [
      ...new Set(starts.map((item) => formatYmdInTimeZone(item, MASTER_TIMEZONE))),
    ]

    expect(dates).toEqual(['2026-08-10', '2026-08-11', '2026-08-12'])
  })

  it('keeps Europe/Minsk wall clock (UTC+3 sanity)', () => {
    const localTen = zonedLocalToUtc('2026-08-10', 600, MASTER_TIMEZONE)

    expect(localTen.toISOString()).toBe('2026-08-10T07:00:00.000Z')
    expect(formatYmdInTimeZone(localTen, MASTER_TIMEZONE)).toBe('2026-08-10')
  })
})
