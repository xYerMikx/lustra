import { describe, expect, it } from 'vitest'

import {
  assertNoPrivateBookingKeys,
  toBookingClientView,
} from '@/modules/bookings/domain/map-booking'

describe('toBookingClientView', () => {
  it('maps booking without private fields', () => {
    const view = toBookingClientView({
      id: '11111111-1111-1111-1111-111111111111',
      masterId: '22222222-2222-2222-2222-222222222222',
      clientUserId: '33333333-3333-3333-3333-333333333333',
      serviceId: '44444444-4444-4444-4444-444444444444',
      serviceTitle: 'Маникюр',
      serviceDurationMin: 90,
      priceAmount: '50.00',
      currency: 'BYN',
      startsAt: new Date('2026-08-12T10:00:00.000Z'),
      endsAt: new Date('2026-08-12T11:30:00.000Z'),
      status: 'hold',
      holdExpiresAt: new Date('2026-08-12T10:10:00.000Z'),
      clientComment: null,
      confirmedAt: null,
      masterNote: 'secret',
    })

    expect(view).not.toHaveProperty('masterNote')
    expect(view).not.toHaveProperty('trustScore')
    expect(view.serviceTitle).toBe('Маникюр')
    expect(view.priceAmount).toBe('50.00')

    expect(() => assertNoPrivateBookingKeys(view)).not.toThrow()
  })
})
