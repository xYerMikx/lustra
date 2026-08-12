import { describe, expect, it } from 'vitest'

import {
  toCatalogMasterCard,
  type CatalogMasterRecord,
} from '@/modules/master-profile/domain/map-catalog-master'

function buildRecord(
  overrides: Partial<CatalogMasterRecord> = {},
): CatalogMasterRecord {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'anna-a1b2c3',
    displayName: 'Анна',
    headline: 'Маникюр',
    boostPriority: 0,
    locations: [
      {
        isPrimary: true,
        district: { name: 'Центр', slug: 'centr' },
      },
    ],
    services: [
      { category: { name: 'Ногти', slug: 'nogti' } },
      { category: { name: 'Ногти', slug: 'nogti' } },
      { category: { name: 'Косметология', slug: 'kosmetologiya' } },
    ],
    stats: {
      ratingAvg: 4.9,
      ratingCount: 12,
      priceMin: 55,
    },
    ...overrides,
  }
}

describe('toCatalogMasterCard', () => {
  it('maps card fields and dedupes specialty categories', () => {
    const card = toCatalogMasterCard(buildRecord())

    expect(card).toEqual({
      id: '11111111-1111-4111-8111-111111111111',
      slug: 'anna-a1b2c3',
      displayName: 'Анна',
      headline: 'Маникюр',
      districtName: 'Центр',
      districtSlug: 'centr',
      ratingAvg: 4.9,
      ratingCount: 12,
      priceFrom: 55,
      specialty: 'Ногти · Косметология',
    })
  })

  it('handles missing location and stats', () => {
    const card = toCatalogMasterCard(
      buildRecord({
        locations: [],
        services: [],
        stats: null,
      }),
    )

    expect(card.districtName).toBeNull()
    expect(card.priceFrom).toBeNull()
    expect(card.specialty).toBeNull()
    expect(card.ratingAvg).toBe(0)
  })
})
