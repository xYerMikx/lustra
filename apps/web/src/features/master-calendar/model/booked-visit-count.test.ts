import { describe, expect, it } from 'vitest'
import type { MasterCalendarSlotView } from '@lumira/contracts'

import { bookedVisitCount } from '@/features/master-calendar/model/booked-visit-count'

function slot(
  overrides: Partial<MasterCalendarSlotView> & { id: string },
): MasterCalendarSlotView {
  return {
    startsAt: '2026-08-20T07:00:00.000Z',
    endsAt: '2026-08-20T07:30:00.000Z',
    status: 'open',
    clientName: null,
    bookingId: null,
    isExtra: false,
    extraPayAmount: null,
    ...overrides,
  }
}

describe('bookedVisitCount', () => {
  it('counts unique booking ids rather than granules', () => {
    expect(
      bookedVisitCount([
        slot({ id: '1', status: 'booked', bookingId: 'b1', clientName: 'А' }),
        slot({ id: '2', status: 'booked', bookingId: 'b1', clientName: 'А' }),
        slot({ id: '3', status: 'booked', bookingId: 'b2', clientName: 'Б' }),
        slot({ id: '4', status: 'open' }),
      ]),
    ).toBe(2)
  })
})
