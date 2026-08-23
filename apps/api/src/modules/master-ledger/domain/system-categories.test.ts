import { describe, expect, it } from 'vitest'

import { slugifyCategoryName } from '@/modules/master-ledger/domain/system-categories'

describe('slugifyCategoryName', () => {
  it('keeps cyrillic names as stable slugs', () => {
    expect(slugifyCategoryName('  Азер  ')).toBe('азер')
  })

  it('collapses spaces', () => {
    expect(slugifyCategoryName('Чаевые VIP')).toBe('чаевые-vip')
  })
})
