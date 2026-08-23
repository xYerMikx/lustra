import { describe, expect, it } from 'vitest'
import type { MasterCalendarSlotView } from '@lustra/contracts'

import { pickUpcomingOpenSlots } from '@/features/master-cabinet/model/pick-upcoming-open-slots'

function slot(
  overrides: Partial<MasterCalendarSlotView> & { id: string },
): MasterCalendarSlotView {
  return {
    startsAt: '2026-08-12T12:00:00.000Z',
    endsAt: '2026-08-12T12:30:00.000Z',
    status: 'open',
    clientName: null,
    bookingId: null,
    isExtra: false,
    extraPayAmount: null,
    ...overrides,
  }
}

describe('pickUpcomingOpenSlots', () => {
  it('keeps future open slots sorted and limited', () => {
    const nowMs = Date.parse('2026-08-12T10:00:00.000Z')

    const result = pickUpcomingOpenSlots(
      [
        slot({
          id: '1',
          startsAt: '2026-08-12T09:00:00.000Z',
          endsAt: '2026-08-12T10:00:00.000Z',
        }),
        slot({
          id: '2',
          startsAt: '2026-08-13T12:00:00.000Z',
          endsAt: '2026-08-13T13:00:00.000Z',
          status: 'booked',
          clientName: 'Оля',
          bookingId: 'b-olya',
        }),
        slot({
          id: '3',
          startsAt: '2026-08-12T15:00:00.000Z',
          endsAt: '2026-08-12T16:00:00.000Z',
        }),
        slot({
          id: '4',
          startsAt: '2026-08-14T09:00:00.000Z',
          endsAt: '2026-08-14T10:00:00.000Z',
        }),
      ],
      nowMs,
      1,
    )

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('3')
  })
})
