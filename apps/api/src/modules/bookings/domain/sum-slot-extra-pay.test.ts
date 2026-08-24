import { describe, expect, it } from 'vitest'

import { sumSlotExtraPay } from '@/modules/bookings/domain/sum-slot-extra-pay'

describe('sumSlotExtraPay', () => {
  it('sums extra pay across occupied granules', () => {
    expect(
      sumSlotExtraPay([
        { extraPayAmount: '10.00' },
        { extraPayAmount: null },
        { extraPayAmount: '5.5' },
      ]),
    ).toBe('15.50')
  })

  it('returns zero when nothing is extra', () => {
    expect(sumSlotExtraPay([{ extraPayAmount: null }])).toBe('0.00')
  })
})
