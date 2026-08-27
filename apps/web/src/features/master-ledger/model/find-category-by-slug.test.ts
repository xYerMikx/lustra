import { describe, expect, it } from 'vitest'
import type { LedgerCategoryView } from '@lustra/contracts'

import { findCategoryBySlug } from '@/features/master-ledger/model/find-category-by-slug'

const categories: LedgerCategoryView[] = [
  { id: '1', kind: 'income', name: 'Услуги', slug: 'service', isSystem: true },
  { id: '2', kind: 'income', name: 'Чаевые', slug: 'tip', isSystem: true },
  { id: '3', kind: 'expense', name: 'Материалы', slug: 'materials', isSystem: true },
]

describe('findCategoryBySlug', () => {
  it('prefers the matching slug and kind', () => {
    expect(findCategoryBySlug(categories, 'tip', 'income')?.id).toBe('2')
    expect(findCategoryBySlug(categories, 'materials', 'expense')?.id).toBe('3')
  })

  it('falls back to the first category of that kind', () => {
    expect(findCategoryBySlug(categories, 'missing', 'income')?.id).toBe('1')
  })
})
