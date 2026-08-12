import { describe, expect, it } from 'vitest'

import {
  assertNoPrivateBookingKeys,
  toBookingClientView,
  toBookingMasterView,
} from '@/modules/bookings/domain/map-booking'
import { sampleBookingRecord } from '@/modules/bookings/domain/sample-booking-record'

describe('toBookingClientView', () => {
  it('maps booking without private fields', () => {
    const view = toBookingClientView(sampleBookingRecord())

    expect(view).not.toHaveProperty('masterNote')
    expect(view).not.toHaveProperty('trustScore')
    expect(view.serviceTitle).toBe('Маникюр')
    expect(view.priceAmount).toBe('50.00')
    expect(view.masterDisplayName).toBe('Анна')
    expect(view.addressExact).toBeNull()

    expect(() => assertNoPrivateBookingKeys(view)).not.toThrow()
  })

  it('exposes addressExact only when confirmed', () => {
    const view = toBookingClientView(
      sampleBookingRecord({
        status: 'confirmed',
        holdExpiresAt: null,
        confirmedAt: new Date('2026-08-12T12:00:00.000Z'),
      }),
    )

    expect(view.addressExact).toBe('ул. Примерная, 1')
  })
})

describe('toBookingMasterView', () => {
  it('includes masterNote and client contact', () => {
    const view = toBookingMasterView(sampleBookingRecord())

    expect(view.masterNote).toBe('secret')
    expect(view.client.name).toBe('Клиент')
    expect(view.client.phone).toBe('+375291112233')
  })
})
