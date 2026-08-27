import { describe, expect, it } from 'vitest'

import { formatLedgerPeriodLabel } from '@/features/master-ledger/model/format-ledger-period'

describe('formatLedgerPeriodLabel', () => {
  it('names a full month', () => {
    expect(formatLedgerPeriodLabel('2026-08-01', '2026-08-31')).toMatch(
      /август 2026/,
    )
  })

  it('uses a day range inside one month', () => {
    expect(formatLedgerPeriodLabel('2026-08-17', '2026-08-23')).toBe(
      '17–23 августа',
    )
  })

  it('uses both month names when the range crosses months', () => {
    expect(formatLedgerPeriodLabel('2026-07-28', '2026-08-03')).toBe(
      '28 июля — 3 августа',
    )
  })
})
