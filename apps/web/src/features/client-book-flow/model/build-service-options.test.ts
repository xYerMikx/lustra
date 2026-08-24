import { describe, expect, it } from 'vitest'
import type { RecommendedServiceView, ServiceTemplateView } from '@lustra/contracts'

import { buildServiceOptions } from '@/features/client-book-flow/model/build-service-options'

const TEMPLATE_MANICURE: ServiceTemplateView = {
  categorySlug: 'nogti',
  title: 'Маникюр комбинированный',
  durationMin: 90,
  price: 60,
  priceType: 'fixed',
}

const TEMPLATE_BROWS: ServiceTemplateView = {
  categorySlug: 'brovi',
  title: 'Коррекция бровей',
  durationMin: 45,
  price: 40,
  priceType: 'fixed',
}

const REC: RecommendedServiceView = {
  serviceTitle: 'Маникюр комбинированный',
  serviceId: '11111111-1111-4111-8111-111111111111',
  categoryId: '22222222-2222-4222-8222-222222222222',
  completedCount: 3,
  lastCompletedAt: '2026-08-01T10:00:00.000Z',
  lastMaster: {
    id: '33333333-3333-4333-8333-333333333333',
    slug: 'anna-nails',
    displayName: 'Анна Ногтева',
  },
}

describe('buildServiceOptions', () => {
  it('puts recommendations first and skips duplicate catalog titles', () => {
    const options = buildServiceOptions({
      recommendations: [REC],
      pastBookings: [],
      templates: [TEMPLATE_MANICURE, TEMPLATE_BROWS],
    })

    expect(options.map((item) => item.source)).toEqual([
      'recommended',
      'catalog',
    ])
    expect(options[0]?.title).toBe('Маникюр комбинированный')
    expect(options[0]?.lastMaster?.slug).toBe('anna-nails')
    expect(options[1]?.title).toBe('Коррекция бровей')
  })

  it('uses past bookings when recommendations are empty', () => {
    const options = buildServiceOptions({
      recommendations: [],
      pastBookings: [
        {
          serviceId: '11111111-1111-4111-8111-111111111111',
          serviceTitle: 'Маникюр комбинированный',
          masterId: '33333333-3333-4333-8333-333333333333',
        },
      ],
      templates: [TEMPLATE_MANICURE],
    })

    expect(options).toHaveLength(1)
    expect(options[0]?.source).toBe('past')
    expect(options[0]?.lastMasterId).toBe(
      '33333333-3333-4333-8333-333333333333',
    )
  })
})
