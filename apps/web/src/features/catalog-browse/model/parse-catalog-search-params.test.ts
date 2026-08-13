import { describe, expect, it } from 'vitest'

import {
  hasActiveCatalogFilters,
  parseCatalogSearchParams,
} from '@/features/catalog-browse/model/parse-catalog-search-params'

describe('parseCatalogSearchParams', () => {
  it('reads filters from the query string', () => {
    expect(
      parseCatalogSearchParams(
        {
          district: 'centr',
          priceMin: '35',
          ratingMin: ['4'],
          sort: 'rating',
        },
        'nogti',
      ),
    ).toEqual({
      category: 'nogti',
      district: ['centr'],
      priceMin: 35,
      ratingMin: 4,
      sort: 'rating',
    })
  })

  it('falls back to category only when the query is invalid', () => {
    expect(
      parseCatalogSearchParams({ ratingMin: 'nope' }, 'nogti'),
    ).toEqual({ category: 'nogti' })
  })
})

describe('hasActiveCatalogFilters', () => {
  it('ignores category and the default sort', () => {
    expect(hasActiveCatalogFilters({ category: 'nogti', sort: 'recommended' })).toBe(
      false,
    )
    expect(hasActiveCatalogFilters({ district: ['centr'] })).toBe(true)
  })
})
