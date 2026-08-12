import { describe, expect, it } from 'vitest'

import {
  bookingStatusLabel,
  formatBookingWhen,
} from '@/features/booking-cabinets/model/booking-labels'

describe('bookingStatusLabel', () => {
  it('maps known statuses', () => {
    expect(bookingStatusLabel('confirmed')).toBe('Подтверждена')
    expect(bookingStatusLabel('pending')).toBe('Ожидает мастера')
  })
})

describe('formatBookingWhen', () => {
  it('formats interval', () => {
    const label = formatBookingWhen(
      '2026-08-20T10:00:00.000Z',
      '2026-08-20T11:30:00.000Z',
    )

    expect(label).toContain('–')
  })
})
