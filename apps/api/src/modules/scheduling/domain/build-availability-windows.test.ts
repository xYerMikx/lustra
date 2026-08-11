import { describe, expect, it } from 'vitest'

import { buildBookableWindows } from '@/modules/scheduling/domain/build-availability-windows'
import {
  MASTER_TIMEZONE,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'

describe('buildBookableWindows', () => {
  const now = zonedLocalToUtc('2026-08-10', 8 * 60, MASTER_TIMEZONE)

  function granule(startMin: number, id: string) {
    const startsAt = zonedLocalToUtc('2026-08-10', startMin, MASTER_TIMEZONE)

    return {
      id,
      startsAt,
      endsAt: new Date(startsAt.getTime() + 30 * 60_000),
    }
  }

  it('requires enough consecutive granules for service duration', () => {
    const windows = buildBookableWindows({
      granules: [
        granule(600, 'a'),
        granule(630, 'b'),
        granule(660, 'c'),
        granule(690, 'd'),
      ],
      durationMin: 90,
      bufferAfterMin: 0,
      granularityMin: 30,
      now,
      minLeadTimeMin: 0,
    })

    expect(windows).toHaveLength(2)
    expect(windows[0]?.startsAt.toISOString()).toBe(
      zonedLocalToUtc('2026-08-10', 600, MASTER_TIMEZONE).toISOString(),
    )
    expect(windows[0]?.endsAt.toISOString()).toBe(
      zonedLocalToUtc('2026-08-10', 690, MASTER_TIMEZONE).toISOString(),
    )
    expect(windows[0]?.slotIds).toEqual(['a', 'b', 'c'])
    expect(windows[1]?.slotIds).toEqual(['b', 'c', 'd'])
  })

  it('does not offer a 90-min service when only 60 min remain', () => {
    const windows = buildBookableWindows({
      granules: [granule(600, 'a'), granule(630, 'b')],
      durationMin: 90,
      bufferAfterMin: 0,
      granularityMin: 30,
      now,
      minLeadTimeMin: 0,
    })

    expect(windows).toEqual([])
  })

  it('applies lead time against injected now', () => {
    const windows = buildBookableWindows({
      granules: [
        granule(600, 'a'),
        granule(630, 'b'),
        granule(660, 'c'),
        granule(690, 'd'),
        granule(720, 'e'),
        granule(750, 'f'),
        granule(780, 'g'),
      ],
      durationMin: 90,
      bufferAfterMin: 0,
      granularityMin: 30,
      now: zonedLocalToUtc('2026-08-10', 9 * 60, MASTER_TIMEZONE),
      minLeadTimeMin: 180,
    })

    // earliest = 12:00 local → first window at 12:00 (720)
    expect(windows[0]?.startsAt.toISOString()).toBe(
      zonedLocalToUtc('2026-08-10', 720, MASTER_TIMEZONE).toISOString(),
    )
  })

  it('includes bufferAfter when counting needed granules', () => {
    const windows = buildBookableWindows({
      granules: [
        granule(600, 'a'),
        granule(630, 'b'),
        granule(660, 'c'),
        granule(690, 'd'),
      ],
      durationMin: 90,
      bufferAfterMin: 30,
      granularityMin: 30,
      now,
      minLeadTimeMin: 0,
    })

    expect(windows).toHaveLength(1)
    expect(windows[0]?.slotIds).toEqual(['a', 'b', 'c', 'd'])
    expect(windows[0]?.endsAt.toISOString()).toBe(
      zonedLocalToUtc('2026-08-10', 690, MASTER_TIMEZONE).toISOString(),
    )
  })
})
