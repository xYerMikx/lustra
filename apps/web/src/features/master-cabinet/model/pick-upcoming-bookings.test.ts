import { describe, expect, it } from 'vitest'
import type { MasterCalendarSlotView } from '@lustra/contracts'

import { pickUpcomingBookings } from '@/features/master-cabinet/model/pick-upcoming-bookings'

function slot(
  overrides: Partial<MasterCalendarSlotView> & { id: string },
): MasterCalendarSlotView {
  return {
    startsAt: '2026-08-12T12:00:00.000Z',
    endsAt: '2026-08-12T12:30:00.000Z',
    status: 'booked',
    clientName: 'Оля',
    bookingId: 'b1',
    isExtra: false,
    extraPayAmount: null,
    ...overrides,
  }
}

describe('pickUpcomingBookings', () => {
  it('shows remaining visits for today while the work day is open', () => {
    const nowMs = Date.parse('2026-08-12T10:00:00.000Z')
    const result = pickUpcomingBookings(
      [
        slot({
          id: 'past',
          startsAt: '2026-08-12T08:00:00.000Z',
          endsAt: '2026-08-12T09:00:00.000Z',
        }),
        slot({
          id: 'next',
          startsAt: '2026-08-12T15:00:00.000Z',
          endsAt: '2026-08-12T16:00:00.000Z',
          clientName: 'Катя',
        }),
        slot({
          id: 'open',
          status: 'open',
          clientName: null,
          bookingId: null,
          startsAt: '2026-08-12T18:00:00.000Z',
          endsAt: '2026-08-12T18:30:00.000Z',
        }),
      ],
      [],
      nowMs,
    )

    expect(result?.isToday).toBe(true)
    expect(result?.slots.map((item) => item.id)).toEqual(['next'])
  })

  it('skips a finished day and a day off, then takes the next working day', () => {
    const nowMs = Date.parse('2026-08-12T20:00:00.000Z')
    const result = pickUpcomingBookings(
      [
        slot({
          id: 'today-done',
          startsAt: '2026-08-12T08:00:00.000Z',
          endsAt: '2026-08-12T09:00:00.000Z',
        }),
        slot({
          id: 'open-today',
          status: 'open',
          clientName: null,
          bookingId: null,
          startsAt: '2026-08-12T10:00:00.000Z',
          endsAt: '2026-08-12T18:00:00.000Z',
        }),
        slot({
          id: 'friday',
          startsAt: '2026-08-14T12:00:00.000Z',
          endsAt: '2026-08-14T13:00:00.000Z',
          clientName: 'Ника',
        }),
      ],
      [
        {
          id: 'off',
          date: '2026-08-13',
          type: 'day_off',
          startMin: null,
          endMin: null,
          granularityMin: null,
          intervals: null,
          note: null,
        },
      ],
      nowMs,
    )

    expect(result?.ymdDate).toBe('2026-08-14')
    expect(result?.slots[0]?.id).toBe('friday')
  })
})
