import { describe, expect, it } from 'vitest'

import {
  parseLedgerIntent,
  parseLedgerKindFilter,
} from '@/features/master-ledger/model/parse-ledger-intent'

describe('parseLedgerIntent', () => {
  it('accepts tip and expense composer intents', () => {
    expect(parseLedgerIntent('tip')).toBe('tip')
    expect(parseLedgerIntent('expense')).toBe('expense')
  })

  it('ignores unknown values', () => {
    expect(parseLedgerIntent('income')).toBeNull()
    expect(parseLedgerIntent('')).toBeNull()
    expect(parseLedgerIntent(null)).toBeNull()
  })

  it('parses ledger kind filters', () => {
    expect(parseLedgerKindFilter('income')).toBe('income')
    expect(parseLedgerKindFilter('expense')).toBe('expense')
    expect(parseLedgerKindFilter('')).toBeUndefined()
  })
})
