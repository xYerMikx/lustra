import { describe, expect, it } from 'vitest'

import type { CompletedClientBookingRow } from '@/modules/recommendations/domain/rank-service-recommendations'
import { rankServiceRecommendations } from '@/modules/recommendations/domain/rank-service-recommendations'

const MANICURE_ID = '11111111-1111-4111-8111-111111111111'
const BROWS_ID = '22222222-2222-4222-8222-222222222222'
const LASHES_ID = '33333333-3333-4333-8333-333333333333'
const PEDICURE_ID = '44444444-4444-4444-8444-444444444444'
const CATEGORY_ID = '55555555-5555-4555-8555-555555555555'
const ANNA_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const OLGA_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

function row(
  partial: Partial<CompletedClientBookingRow> &
    Pick<CompletedClientBookingRow, 'serviceTitle' | 'completedAt'>,
): CompletedClientBookingRow {
  return {
    serviceId: null,
    categoryId: CATEGORY_ID,
    master: {
      id: ANNA_ID,
      slug: 'anna',
      displayName: 'Анна',
    },
    ...partial,
  }
}

describe('rankServiceRecommendations', () => {
  it('ranks manicure first when it has more completed visits than brows', () => {
    const ranked = rankServiceRecommendations([
      row({
        serviceId: MANICURE_ID,
        serviceTitle: 'Маникюр',
        completedAt: new Date('2026-08-01T10:00:00.000Z'),
      }),
      row({
        serviceId: MANICURE_ID,
        serviceTitle: 'Маникюр',
        completedAt: new Date('2026-08-10T10:00:00.000Z'),
        master: {
          id: OLGA_ID,
          slug: 'olga',
          displayName: 'Ольга',
        },
      }),
      row({
        serviceId: BROWS_ID,
        serviceTitle: 'Брови',
        completedAt: new Date('2026-08-20T10:00:00.000Z'),
      }),
    ])

    expect(ranked.map((item) => item.serviceTitle)).toEqual(['Маникюр', 'Брови'])
    expect(ranked[0]?.completedCount).toBe(2)
    expect(ranked[0]?.lastCompletedAt).toBe('2026-08-10T10:00:00.000Z')
    expect(ranked[0]?.lastMaster).toEqual({
      id: OLGA_ID,
      slug: 'olga',
      displayName: 'Ольга',
    })
    expect(ranked[1]?.completedCount).toBe(1)
  })

  it('breaks frequency ties by lastCompletedAt descending', () => {
    const ranked = rankServiceRecommendations([
      row({
        serviceId: BROWS_ID,
        serviceTitle: 'Брови',
        completedAt: new Date('2026-08-01T10:00:00.000Z'),
      }),
      row({
        serviceId: MANICURE_ID,
        serviceTitle: 'Маникюр',
        completedAt: new Date('2026-08-20T10:00:00.000Z'),
      }),
    ])

    expect(ranked.map((item) => item.serviceTitle)).toEqual(['Маникюр', 'Брови'])
  })

  it('groups untitled catalog rows by serviceTitle when serviceId is null', () => {
    const ranked = rankServiceRecommendations([
      row({
        serviceTitle: 'Маникюр',
        completedAt: new Date('2026-08-01T10:00:00.000Z'),
      }),
      row({
        serviceTitle: 'Маникюр',
        completedAt: new Date('2026-08-11T10:00:00.000Z'),
      }),
      row({
        serviceTitle: 'Брови',
        completedAt: new Date('2026-08-12T10:00:00.000Z'),
      }),
    ])

    expect(ranked[0]).toMatchObject({
      serviceTitle: 'Маникюр',
      serviceId: null,
      completedCount: 2,
    })
  })

  it('returns at most three recommendations', () => {
    const ranked = rankServiceRecommendations([
      row({
        serviceId: MANICURE_ID,
        serviceTitle: 'Маникюр',
        completedAt: new Date('2026-08-04T10:00:00.000Z'),
      }),
      row({
        serviceId: BROWS_ID,
        serviceTitle: 'Брови',
        completedAt: new Date('2026-08-03T10:00:00.000Z'),
      }),
      row({
        serviceId: LASHES_ID,
        serviceTitle: 'Ресницы',
        completedAt: new Date('2026-08-02T10:00:00.000Z'),
      }),
      row({
        serviceId: PEDICURE_ID,
        serviceTitle: 'Педикюр',
        completedAt: new Date('2026-08-01T10:00:00.000Z'),
      }),
    ])

    expect(ranked).toHaveLength(3)
    expect(ranked.map((item) => item.serviceTitle)).toEqual([
      'Маникюр',
      'Брови',
      'Ресницы',
    ])
  })

  it('strips masterNote and trustScore from lastMaster', () => {
    const leakedMaster = {
      id: ANNA_ID,
      slug: 'anna',
      displayName: 'Анна',
      trustScore: 42,
      masterNote: 'не светить',
    }
    const ranked = rankServiceRecommendations([
      row({
        serviceId: MANICURE_ID,
        serviceTitle: 'Маникюр',
        completedAt: new Date('2026-08-01T10:00:00.000Z'),
        master: leakedMaster,
      }),
    ])

    expect(ranked[0]?.lastMaster).toEqual({
      id: ANNA_ID,
      slug: 'anna',
      displayName: 'Анна',
    })
    expect(JSON.stringify(ranked)).not.toContain('trustScore')
    expect(JSON.stringify(ranked)).not.toContain('masterNote')
  })
})
