import { describe, expect, it } from 'vitest'

import { catalogOrderBy } from '@/modules/master-profile/infra/catalog-order-by'

describe('catalogOrderBy', () => {
  it('uses boost and rating for the default recommended sort', () => {
    expect(catalogOrderBy(undefined)[0]).toEqual({ boostPriority: 'desc' })
    expect(catalogOrderBy('recommended')[0]).toEqual({ boostPriority: 'desc' })
  })

  it('sorts by price with nulls last', () => {
    expect(catalogOrderBy('price_asc')).toEqual([
      { stats: { priceMin: { sort: 'asc', nulls: 'last' } } },
    ])
  })

  it('sorts by rating then review count', () => {
    expect(catalogOrderBy('rating')).toEqual([
      { stats: { ratingAvg: 'desc' } },
      { stats: { ratingCount: 'desc' } },
    ])
  })
})
