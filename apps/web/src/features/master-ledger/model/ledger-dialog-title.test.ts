import { describe, expect, it } from 'vitest'

import { ledgerDialogTitle } from '@/features/master-ledger/model/ledger-dialog-title'

describe('ledgerDialogTitle', () => {
  it('names a tip attached to a visit', () => {
    expect(ledgerDialogTitle('tip', 'booking-1')).toBe('Чаевые к визиту')
  })

  it('names a standalone tip', () => {
    expect(ledgerDialogTitle('tip')).toBe('Чаевые')
  })

  it('names an expense', () => {
    expect(ledgerDialogTitle('expense')).toBe('Расход')
  })
})
