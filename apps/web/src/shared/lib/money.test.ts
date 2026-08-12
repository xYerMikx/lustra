import { describe, expect, it } from 'vitest'

import { formatByn, formatPriceLabel } from '@/shared/lib/money'

describe('money', () => {
  it('formats BYN amounts', () => {
    expect(formatByn(55)).toBe('55 BYN')
    expect(formatByn(55.5)).toBe('55,5 BYN')
  })

  it('formats price types', () => {
    expect(
      formatPriceLabel({
        price: 40,
        priceMax: null,
        priceType: 'from',
        currency: 'BYN',
      }),
    ).toBe('от 40 BYN')

    expect(
      formatPriceLabel({
        price: 50,
        priceMax: 70,
        priceType: 'range',
        currency: 'BYN',
      }),
    ).toBe('50 BYN–70 BYN')
  })
})
