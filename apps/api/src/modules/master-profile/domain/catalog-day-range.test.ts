import { describe, expect, it } from 'vitest'

import { catalogDayUtcRange } from '@/modules/master-profile/domain/catalog-day-range'

describe('catalogDayUtcRange', () => {
  it('covers a Europe/Minsk calendar day in UTC', () => {
    const range = catalogDayUtcRange('2026-08-14')

    expect(range.start.toISOString()).toBe('2026-08-13T21:00:00.000Z')
    expect(range.end.toISOString()).toBe('2026-08-14T21:00:00.000Z')
  })
})
