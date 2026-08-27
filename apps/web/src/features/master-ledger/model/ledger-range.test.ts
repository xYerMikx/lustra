import { describe, expect, it } from 'vitest'

import {
  detectLedgerPreset,
  ledgerRangeForPreset,
} from '@/features/master-ledger/model/ledger-range'

describe('ledgerRangeForPreset', () => {
  const sunday = new Date('2026-08-23T12:00:00.000Z')

  it('uses the current ISO week', () => {
    expect(ledgerRangeForPreset('week', sunday)).toEqual({
      from: '2026-08-17',
      to: '2026-08-23',
    })
  })

  it('uses two ISO weeks including the current one', () => {
    expect(ledgerRangeForPreset('two_weeks', sunday)).toEqual({
      from: '2026-08-10',
      to: '2026-08-23',
    })
  })

  it('uses the current month', () => {
    expect(ledgerRangeForPreset('month', sunday)).toEqual({
      from: '2026-08-01',
      to: '2026-08-31',
    })
  })

  it('detects a matching preset from the query range', () => {
    expect(detectLedgerPreset('2026-08-17', '2026-08-23', sunday)).toBe('week')
    expect(detectLedgerPreset('2026-08-10', '2026-08-23', sunday)).toBe(
      'two_weeks',
    )
    expect(detectLedgerPreset('2026-08-01', '2026-08-31', sunday)).toBe('month')
    expect(detectLedgerPreset('2026-07-01', '2026-07-31', sunday)).toBeNull()
  })
})
