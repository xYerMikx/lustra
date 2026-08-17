import { describe, expect, it } from 'vitest'

import {
  catalogHref,
  hrefForCategory,
} from '@/features/catalog-browse/model/href-for-category'

describe('catalogHref', () => {
  it('omits the default recommended sort', () => {
    expect(catalogHref({ category: 'nogti', sort: 'recommended' })).toBe(
      '/catalog/nogti',
    )
  })

  it('keeps price, district and sort in the query', () => {
    expect(
      catalogHref({
        district: ['centr'],
        priceMin: 40,
        sort: 'price_asc',
      }),
    ).toBe('/catalog?district=centr&priceMin=40&sort=price_asc')
  })
})

describe('hrefForCategory', () => {
  it('builds catalog and category paths with optional district', () => {
    expect(hrefForCategory(undefined)).toBe('/catalog')
    expect(hrefForCategory('depilyatsiya')).toBe('/catalog/depilyatsiya')
    expect(hrefForCategory('depilyatsiya', { district: ['centr'] })).toBe(
      '/catalog/depilyatsiya?district=centr',
    )
    expect(hrefForCategory(undefined, { district: ['centr'] })).toBe(
      '/catalog?district=centr',
    )
  })
})
