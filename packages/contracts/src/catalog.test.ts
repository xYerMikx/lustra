import { describe, expect, it } from 'vitest'

import { SearchMastersQuerySchema } from './catalog'

describe('SearchMastersQuerySchema', () => {
  it('treats blank query strings as unset', () => {
    expect(
      SearchMastersQuerySchema.parse({
        district: '',
        priceMin: '',
        priceMax: '',
        ratingMin: '',
        locationType: '',
        sort: '',
      }),
    ).toEqual({})
  })

  it('coerces numeric filters and sort', () => {
    expect(
      SearchMastersQuerySchema.parse({
        category: 'nogti',
        district: 'centr',
        priceMin: '40',
        priceMax: '90',
        ratingMin: '4',
        locationType: 'salon',
        sort: 'price_asc',
      }),
    ).toEqual({
      category: 'nogti',
      district: 'centr',
      priceMin: 40,
      priceMax: 90,
      ratingMin: 4,
      locationType: 'salon',
      sort: 'price_asc',
    })
  })
})
