import { describe, expect, it } from 'vitest'

import {
  parseMoneyAmount,
  subtractMoney,
  sumMoney,
} from '@/modules/master-ledger/domain/parse-money'

describe('parseMoneyAmount', () => {
  it('accepts comma decimals', () => {
    expect(parseMoneyAmount('12,5')).toBe('12.50')
  })

  it('rejects zero', () => {
    expect(() => parseMoneyAmount('0')).toThrow('INVALID_MONEY')
  })
})

describe('money totals', () => {
  it('nets income minus expenses', () => {
    expect(sumMoney(['10.00', '2.50'])).toBe('12.50')
    expect(subtractMoney('12.50', '3.00')).toBe('9.50')
  })
})
