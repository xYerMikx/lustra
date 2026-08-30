import { describe, expect, it } from 'vitest'
import type { MasterCalendarSlotView } from '@lumira/contracts'

import { mergeSlotSpans } from '@/features/master-calendar/model/merge-slot-spans'

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

describe('mergeSlotSpans', () => {
  it('keeps open granules separate and merges a booked visit', () => {
    const spans = mergeSlotSpans([
      slot({
        id: 'open-1',
        startsAt: '2026-08-20T07:00:00.000Z',
        endsAt: '2026-08-20T07:30:00.000Z',
      }),
      slot({
        id: 'b1a',
        status: 'booked',
        clientName: 'Ерм',
        bookingId: 'booking-1',
        startsAt: '2026-08-20T07:00:00.000Z',
        endsAt: '2026-08-20T07:30:00.000Z',
      }),
      slot({
        id: 'b1b',
        status: 'booked',
        clientName: 'Ерм',
        bookingId: 'booking-1',
        startsAt: '2026-08-20T07:30:00.000Z',
        endsAt: '2026-08-20T08:00:00.000Z',
      }),
    ])

    const booked = spans.filter((item) => item.status === 'booked')

    expect(booked).toHaveLength(1)
    expect(booked[0]?.durationMin).toBe(60)
    expect(booked[0]?.bookingId).toBe('booking-1')
  })
})
