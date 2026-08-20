import { describe, expect, it } from 'vitest'

import { bookingStatusTone } from '@/features/booking-cabinets/model/booking-status-tone'

describe('bookingStatusTone', () => {
  it('groups statuses by how loud they should look', () => {
    expect(bookingStatusTone('pending')).toBe('hold')
    expect(bookingStatusTone('confirmed')).toBe('confirmed')
    expect(bookingStatusTone('completed')).toBe('done')
    expect(bookingStatusTone('cancelled_by_master')).toBe('muted')
    expect(bookingStatusTone('no_show')).toBe('alert')
  })
})
