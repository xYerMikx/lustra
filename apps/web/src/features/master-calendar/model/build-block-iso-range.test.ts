import { describe, expect, it } from 'vitest'

import { buildBlockIsoRange } from '@/features/master-calendar/model/build-block-iso-range'
import { zonedLocalToUtc } from '@/shared/lib/tz'

describe('buildBlockIsoRange', () => {
  it('builds a full-day range in master timezone', () => {
    const range = buildBlockIsoRange({
      date: '2026-08-11',
      allDay: true,
      startTime: '00:00',
      endTime: '00:00',
    })

    expect(range.startsAt).toBe(
      zonedLocalToUtc('2026-08-11', 0).toISOString(),
    )
    expect(range.endsAt).toBe(zonedLocalToUtc('2026-08-12', 0).toISOString())
  })

  it('builds an intra-day lunch interval', () => {
    const range = buildBlockIsoRange({
      date: '2026-08-11',
      allDay: false,
      startTime: '13:00',
      endTime: '14:00',
    })

    expect(range.startsAt).toBe(
      zonedLocalToUtc('2026-08-11', 13 * 60).toISOString(),
    )
    expect(range.endsAt).toBe(
      zonedLocalToUtc('2026-08-11', 14 * 60).toISOString(),
    )
  })
})
