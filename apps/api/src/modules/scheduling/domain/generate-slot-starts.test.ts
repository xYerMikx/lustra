import { describe, expect, it } from 'vitest'

import { generateSlotStarts } from '@/modules/scheduling/domain/generate-slot-starts'
import {
  MASTER_TIMEZONE,
  formatYmdDateInTimeZone,
  isoWeekdayForYmdDate,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'

describe('generateSlotStarts', () => {
  const now = zonedLocalToUtc('2026-08-10', 9 * 60, MASTER_TIMEZONE)

  it('returns empty when there are no rules', () => {
    const starts = generateSlotStarts({
      now,
      fromYmdDate: '2026-08-10',
      toYmdDate: '2026-08-12',
      granularityMin: 30,
      maxHorizonDays: 30,
      rules: [],
      exceptions: [],
      blocks: [],
    })

    expect(starts).toEqual([])
  })

  it('builds TimeSlot starts from weekday rules aligned to interval start', () => {
    expect(isoWeekdayForYmdDate('2026-08-10', MASTER_TIMEZONE)).toBe(1)

    const starts = generateSlotStarts({
      now,
      fromYmdDate: '2026-08-10',
      toYmdDate: '2026-08-10',
      granularityMin: 30,
      maxHorizonDays: 30,
      rules: [{ weekday: 1, startMin: 600, endMin: 720 }],
      exceptions: [],
      blocks: [],
    })

    expect(starts.map((item) => item.startsAt.toISOString())).toEqual([
      zonedLocalToUtc('2026-08-10', 600, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 630, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 660, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 690, MASTER_TIMEZONE).toISOString(),
    ])
  })

  it('drops a tail shorter than granularity', () => {
    const starts = generateSlotStarts({
      now,
      fromYmdDate: '2026-08-10',
      toYmdDate: '2026-08-10',
      granularityMin: 30,
      maxHorizonDays: 30,
      rules: [{ weekday: 1, startMin: 600, endMin: 650 }],
      exceptions: [],
      blocks: [],
    })

    expect(starts).toHaveLength(1)
    expect(starts[0]?.startsAt.toISOString()).toBe(
      zonedLocalToUtc('2026-08-10', 600, MASTER_TIMEZONE).toISOString(),
    )
  })

  it('respects day_off exceptions', () => {
    const starts = generateSlotStarts({
      now,
      fromYmdDate: '2026-08-10',
      toYmdDate: '2026-08-10',
      granularityMin: 30,
      maxHorizonDays: 30,
      rules: [{ weekday: 1, startMin: 600, endMin: 720 }],
      exceptions: [{ ymdDate: '2026-08-10', type: 'day_off' }],
      blocks: [],
    })

    expect(starts).toEqual([])
  })

  it('uses custom_hours exceptions instead of weekly rules', () => {
    const starts = generateSlotStarts({
      now,
      fromYmdDate: '2026-08-10',
      toYmdDate: '2026-08-10',
      granularityMin: 30,
      maxHorizonDays: 30,
      rules: [{ weekday: 1, startMin: 600, endMin: 1200 }],
      exceptions: [
        {
          ymdDate: '2026-08-10',
          type: 'custom_hours',
          startMin: 660,
          endMin: 720,
        },
      ],
      blocks: [],
    })

    expect(starts.map((item) => item.startsAt.toISOString())).toEqual([
      zonedLocalToUtc('2026-08-10', 660, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 690, MASTER_TIMEZONE).toISOString(),
    ])
  })

  it('subtracts lunch blocks from the working interval', () => {
    const starts = generateSlotStarts({
      now,
      fromYmdDate: '2026-08-10',
      toYmdDate: '2026-08-10',
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

    expect(starts.map((item) => item.startsAt.toISOString())).toEqual([
      zonedLocalToUtc('2026-08-10', 600, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 630, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 720, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 750, MASTER_TIMEZONE).toISOString(),
    ])
  })

  it('clips range to horizon and today', () => {
    const starts = generateSlotStarts({
      now,
      fromYmdDate: '2026-08-01',
      toYmdDate: '2026-09-30',
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
      ...new Set(
        starts.map((item) =>
          formatYmdDateInTimeZone(item.startsAt, MASTER_TIMEZONE),
        ),
      ),
    ]

    expect(dates).toEqual(['2026-08-10', '2026-08-11', '2026-08-12'])
  })

  it('keeps Europe/Minsk wall clock (UTC+3 sanity)', () => {
    const localTen = zonedLocalToUtc('2026-08-10', 600, MASTER_TIMEZONE)

    expect(localTen.toISOString()).toBe('2026-08-10T07:00:00.000Z')
    expect(formatYmdDateInTimeZone(localTen, MASTER_TIMEZONE)).toBe('2026-08-10')
  })

  it('uses custom intervals and day-level granularity', () => {
    const starts = generateSlotStarts({
      now,
      fromYmdDate: '2026-08-10',
      toYmdDate: '2026-08-10',
      granularityMin: 30,
      maxHorizonDays: 30,
      rules: [{ weekday: 1, startMin: 600, endMin: 1200 }],
      exceptions: [
        {
          ymdDate: '2026-08-10',
          type: 'custom_hours',
          granularityMin: 60,
          intervals: [
            { startMin: 600, endMin: 720 },
            { startMin: 840, endMin: 900 },
          ],
        },
      ],
      blocks: [],
    })

    expect(starts.map((item) => item.startsAt.toISOString())).toEqual([
      zonedLocalToUtc('2026-08-10', 600, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 660, MASTER_TIMEZONE).toISOString(),
      zonedLocalToUtc('2026-08-10', 840, MASTER_TIMEZONE).toISOString(),
    ])
    expect(starts.every((item) => item.granularityMin === 60)).toBe(true)
  })
})
