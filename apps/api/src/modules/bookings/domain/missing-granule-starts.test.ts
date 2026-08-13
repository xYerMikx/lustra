import { describe, expect, it } from 'vitest'

import { missingGranuleStarts } from '@/modules/bookings/domain/missing-granule-starts'

describe('missingGranuleStarts', () => {
  const start = new Date('2026-08-20T10:00:00.000Z')
  const coverageEnd = new Date('2026-08-20T11:00:00.000Z')

  it('returns every step when the range is empty', () => {
    expect(missingGranuleStarts(start, coverageEnd, 30, [])).toEqual([
      new Date('2026-08-20T10:00:00.000Z'),
      new Date('2026-08-20T10:30:00.000Z'),
    ])
  })

  it('skips timestamps that already exist', () => {
    expect(
      missingGranuleStarts(start, coverageEnd, 30, [
        new Date('2026-08-20T10:00:00.000Z'),
      ]),
    ).toEqual([new Date('2026-08-20T10:30:00.000Z')])
  })

  it('returns nothing when coverage is already full', () => {
    expect(
      missingGranuleStarts(start, coverageEnd, 30, [
        new Date('2026-08-20T10:00:00.000Z'),
        new Date('2026-08-20T10:30:00.000Z'),
      ]),
    ).toEqual([])
  })
})
