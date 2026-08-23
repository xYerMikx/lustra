import { describe, expect, it } from 'vitest'

import { busyRangesForException } from '@/modules/master-schedule/domain/busy-ranges-for-exception'

describe('busyRangesForException', () => {
  it('covers the whole local day for day_off', () => {
    const ranges = busyRangesForException({
      ymdDate: '2026-08-15',
      type: 'day_off',
    })

    expect(ranges).toHaveLength(1)
    expect(ranges[0]?.startsAt.toISOString()).toBe('2026-08-14T21:00:00.000Z')
    expect(ranges[0]?.endsAt.toISOString()).toBe('2026-08-15T21:00:00.000Z')
  })

  it('covers hours outside custom_hours', () => {
    const ranges = busyRangesForException({
      ymdDate: '2026-08-15',
      type: 'custom_hours',
      startMin: 10 * 60,
      endMin: 14 * 60,
    })

    expect(ranges).toHaveLength(2)
    expect(ranges[0]?.startsAt.toISOString()).toBe('2026-08-14T21:00:00.000Z')
    expect(ranges[0]?.endsAt.toISOString()).toBe('2026-08-15T07:00:00.000Z')
    expect(ranges[1]?.startsAt.toISOString()).toBe('2026-08-15T11:00:00.000Z')
    expect(ranges[1]?.endsAt.toISOString()).toBe('2026-08-15T21:00:00.000Z')
  })

  it('keeps gaps between custom windows as busy', () => {
    const ranges = busyRangesForException({
      ymdDate: '2026-08-15',
      type: 'custom_hours',
      intervals: [
        { startMin: 10 * 60, endMin: 12 * 60 },
        { startMin: 14 * 60, endMin: 15 * 60 },
      ],
    })

    expect(ranges).toHaveLength(3)
    expect(ranges[1]?.startsAt.toISOString()).toBe('2026-08-15T09:00:00.000Z')
    expect(ranges[1]?.endsAt.toISOString()).toBe('2026-08-15T11:00:00.000Z')
  })
})
