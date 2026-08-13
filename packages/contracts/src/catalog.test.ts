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
      district: ['centr'],
      priceMin: 40,
      priceMax: 90,
      ratingMin: 4,
      locationType: 'salon',
      sort: 'price_asc',
    })
  })

  it('accepts several districts, a service title, and a calendar day', () => {
    expect(
      SearchMastersQuerySchema.parse({
        service: 'Маникюр классический',
        district: ['centr', 'frunzenskiy'],
        availableOn: '2026-08-14',
      }),
    ).toEqual({
      service: 'Маникюр классический',
      district: ['centr', 'frunzenskiy'],
      availableOn: '2026-08-14',
    })
  })
})
