import { describe, expect, it } from 'vitest'
import type { PublicServiceView } from '@lumira/contracts'

import {
  matchMasterService,
  orderServicesForPicker,
} from '@/features/client-book-flow/model/match-master-service'

const MANICURE: PublicServiceView = {
  id: '11111111-1111-4111-8111-111111111111',
  categoryName: 'Ногти',
  categorySlug: 'nogti',
  title: 'Маникюр комбинированный',
  description: null,
  durationMin: 90,
  price: 60,
  priceMax: null,
  priceType: 'fixed',
  currency: 'BYN',
}

const BROWS: PublicServiceView = {
  id: '22222222-2222-4222-8222-222222222222',
  categoryName: 'Брови',
  categorySlug: 'brovi',
  title: 'Коррекция бровей',
  description: null,
  durationMin: 45,
  price: 40,
  priceMax: null,
  priceType: 'fixed',
  currency: 'BYN',
}

describe('matchMasterService', () => {
  it('matches by id then by title', () => {
    expect(
      matchMasterService([MANICURE, BROWS], {
        serviceId: MANICURE.id,
        title: 'other',
      })?.id,
    ).toBe(MANICURE.id)

    expect(
      matchMasterService([MANICURE, BROWS], {
        serviceId: '33333333-3333-4333-8333-333333333333',
        title: 'Коррекция бровей',
      })?.id,
    ).toBe(BROWS.id)
  })
})

describe('orderServicesForPicker', () => {
  it('moves the matched service first', () => {
    const ordered = orderServicesForPicker([BROWS, MANICURE], {
      serviceId: null,
      title: 'Маникюр комбинированный',
    })

    expect(ordered.map((item) => item.id)).toEqual([MANICURE.id, BROWS.id])
  })
})
