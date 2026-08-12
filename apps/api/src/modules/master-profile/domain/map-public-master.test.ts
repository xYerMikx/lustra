import { describe, expect, it } from 'vitest'

import {
  assertNoPrivateKeys,
  toPublicMasterView,
  type PublicMasterRecord,
} from '@/modules/master-profile/domain/map-public-master'

function buildRecord(
  overrides: Partial<PublicMasterRecord> = {},
): PublicMasterRecord {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'anna-a1b2c3',
    displayName: 'Анна',
    headline: 'Маникюр',
    bio: 'Аккуратно',
    status: 'published',
    experienceSince: 2019,
    languages: ['ru'],
    locations: [
      {
        id: '22222222-2222-4222-8222-222222222222',
        districtId: '33333333-3333-4333-8333-333333333333',
        type: 'home_studio',
        addressHint: 'возле метро',
        isPrimary: true,
        district: {
          id: '33333333-3333-4333-8333-333333333333',
          name: 'Центр',
          slug: 'centr',
          city: 'Minsk',
        },
      },
    ],
    services: [
      {
        id: '44444444-4444-4444-8444-444444444444',
        title: 'Маникюр',
        description: null,
        durationMin: 90,
        price: 55,
        priceMax: null,
        priceType: 'fixed',
        currency: 'BYN',
        category: { name: 'Ногти', slug: 'nogti' },
      },
    ],
    contact: {
      publicPhone: '+375291112233',
      instagram: 'anna.nails',
      telegramUsername: null,
    },
    stats: {
      ratingAvg: 4.9,
      ratingCount: 12,
    },
    ...overrides,
  }
}

describe('toPublicMasterView', () => {
  it('maps public fields and keeps addressHint', () => {
    const view = toPublicMasterView(buildRecord())

    expect(view.slug).toBe('anna-a1b2c3')
    expect(view.primaryLocation?.addressHint).toBe('возле метро')
    expect(view.services[0]?.price).toBe(55)
    expect(view.ratingAvg).toBe(4.9)
  })

  it('never serializes private keys', () => {
    const view = toPublicMasterView(buildRecord())

    expect(() => assertNoPrivateKeys(view)).not.toThrow()
    expect(JSON.stringify(view)).not.toContain('addressExact')
    expect(JSON.stringify(view)).not.toContain('trustScore')
    expect(JSON.stringify(view)).not.toContain('masterNote')
    expect(JSON.stringify(view)).not.toContain('boostPriority')
  })
})
