import { describe, expect, it } from 'vitest'

import { ledgerRangeForPreset } from '@/features/master-ledger/model/ledger-range'

describe('ledgerRangeForPreset', () => {
  const sunday = new Date('2026-08-23T12:00:00.000Z')

  it('uses the current ISO week', () => {
    expect(ledgerRangeForPreset('week', sunday)).toEqual({
      from: '2026-08-17',
      to: '2026-08-23',
    })
  })

  it('uses the current month', () => {
    expect(ledgerRangeForPreset('month', sunday)).toEqual({
      from: '2026-08-01',
      to: '2026-08-31',
    })
  })
})
