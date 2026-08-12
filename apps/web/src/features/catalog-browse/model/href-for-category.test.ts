import { describe, expect, it } from 'vitest'

import { hrefForCategory } from '@/features/catalog-browse/model/href-for-category'

describe('hrefForCategory', () => {
  it('builds catalog and category paths with optional district', () => {
    expect(hrefForCategory(undefined)).toBe('/catalog')
    expect(hrefForCategory('depilyatsiya')).toBe('/catalog/depilyatsiya')
    expect(hrefForCategory('depilyatsiya', 'centr')).toBe(
      '/catalog/depilyatsiya?district=centr',
    )
    expect(hrefForCategory(undefined, 'centr')).toBe('/catalog?district=centr')
  })
})
