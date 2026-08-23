import { describe, expect, it } from 'vitest'

import {
  rangeForPreset,
  resolveLedgerRange,
  ymdInMinsk,
} from '@/modules/master-ledger/domain/ledger-period'

describe('ledger period', () => {
  const sunday = new Date('2026-08-23T12:00:00.000Z')

  it('uses Minsk calendar date', () => {
    expect(ymdInMinsk(sunday)).toBe('2026-08-23')
  })

  it('resolves current ISO week Monday-Sunday', () => {
    expect(rangeForPreset('week', sunday)).toEqual({
      from: '2026-08-17',
      to: '2026-08-23',
    })
  })

  it('resolves two weeks ending this Sunday', () => {
    expect(rangeForPreset('two_weeks', sunday)).toEqual({
      from: '2026-08-10',
      to: '2026-08-23',
    })
  })

  it('resolves calendar month when dates omitted', () => {
    expect(resolveLedgerRange(sunday, {})).toEqual({
      from: '2026-08-01',
      to: '2026-08-31',
    })
  })
})
