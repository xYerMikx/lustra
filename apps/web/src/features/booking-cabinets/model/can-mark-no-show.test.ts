import { describe, expect, it } from 'vitest'

import { canMarkNoShow } from '@/features/booking-cabinets/model/can-mark-no-show'

describe('canMarkNoShow', () => {
  it('allows pending and confirmed', () => {
    expect(canMarkNoShow('pending')).toBe(true)
    expect(canMarkNoShow('confirmed')).toBe(true)
  })

  it('rejects hold and terminal statuses', () => {
    expect(canMarkNoShow('hold')).toBe(false)
    expect(canMarkNoShow('completed')).toBe(false)
    expect(canMarkNoShow('no_show')).toBe(false)
  })
})
