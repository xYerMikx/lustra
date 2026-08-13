import { describe, expect, it } from 'vitest'

import { noShowRate } from '@/modules/bookings/domain/no-show-rate'

describe('noShowRate', () => {
  it('returns zero when there are no finished visits', () => {
    expect(noShowRate(0, 0)).toBe('0.00')
  })

  it('is the share of no-shows among finished visits', () => {
    expect(noShowRate(3, 1)).toBe('25.00')
    expect(noShowRate(0, 2)).toBe('100.00')
  })
})
