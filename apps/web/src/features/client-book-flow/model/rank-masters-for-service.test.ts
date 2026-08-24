import { describe, expect, it } from 'vitest'
import type { CatalogMasterCard } from '@lustra/contracts'

import { rankMastersForService } from '@/features/client-book-flow/model/rank-masters-for-service'
import type { ClientBookServiceOption } from '@/features/client-book-flow/model/types'

const ANNA: CatalogMasterCard = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'anna-nails',
  displayName: 'Анна Ногтева',
  headline: 'Маникюр',
  districtName: 'Фрунзенский',
  districtSlug: 'frunzenskiy',
  ratingAvg: 4.8,
  ratingCount: 12,
  priceFrom: 60,
  specialty: 'Маникюр комбинированный',
}

const BORIS: CatalogMasterCard = {
  id: '22222222-2222-4222-8222-222222222222',
  slug: 'boris-brows',
  displayName: 'Борис Бровист',
  headline: 'Брови',
  districtName: 'Московский',
  districtSlug: 'moskovskiy',
  ratingAvg: 4.2,
  ratingCount: 4,
  priceFrom: 90,
  specialty: 'Коррекция бровей',
}

const SERVICE: ClientBookServiceOption = {
  key: 'catalog:маникюр комбинированный',
  title: 'Маникюр комбинированный',
  categorySlug: 'nogti',
  serviceId: null,
  source: 'catalog',
  lastMaster: null,
  lastMasterId: ANNA.id,
}

describe('rankMastersForService', () => {
  it('puts last master, then matching favorites, then catalog', () => {
    const ranked = rankMastersForService({
      service: SERVICE,
      favorites: [BORIS, ANNA],
      catalog: [BORIS, ANNA],
    })

    expect(ranked.map((item) => item.slug)).toEqual([
      'anna-nails',
      'boris-brows',
    ])
    expect(ranked[0]?.source).toBe('last')
  })

  it('keeps lastMaster ref when the card is missing from lists', () => {
    const ranked = rankMastersForService({
      service: {
        ...SERVICE,
        lastMasterId: null,
        lastMaster: {
          id: ANNA.id,
          slug: ANNA.slug,
          displayName: ANNA.displayName,
        },
      },
      favorites: [],
      catalog: [BORIS],
    })

    expect(ranked[0]?.source).toBe('last')
    expect(ranked[0]?.slug).toBe('anna-nails')
    expect(ranked.map((item) => item.slug)).toEqual([
      'anna-nails',
      'boris-brows',
    ])
  })
})
