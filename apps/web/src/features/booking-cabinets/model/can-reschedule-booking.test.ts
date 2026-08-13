import { describe, expect, it } from 'vitest'

import { canRescheduleBooking } from '@/features/booking-cabinets/model/can-reschedule-booking'

describe('canRescheduleBooking', () => {
  it('allows pending and confirmed only', () => {
    expect(canRescheduleBooking('pending')).toBe(true)
    expect(canRescheduleBooking('confirmed')).toBe(true)
    expect(canRescheduleBooking('hold')).toBe(false)
    expect(canRescheduleBooking('completed')).toBe(false)
  })
})
