import { describe, expect, it } from 'vitest'

import { calendarSpanLabel } from '@/features/master-calendar/model/calendar-span-label'
import type { CalendarSpan } from '@/features/master-calendar/model/merge-slot-spans'

function span(overrides: Partial<CalendarSpan>): CalendarSpan {
  return {
    id: 's1',
    startsAt: '2026-08-20T07:00:00.000Z',
    endsAt: '2026-08-20T08:00:00.000Z',
    status: 'booked',
    clientName: 'Ерм',
    bookingId: 'booking-1',
    durationMin: 60,
    ...overrides,
  }
}

describe('calendarSpanLabel', () => {
  it('shows a booked visit as one range with duration', () => {
    expect(calendarSpanLabel(span({}), '10:00', '11:00')).toBe(
      '10:00–11:00 · Ерм · 60 мин',
    )
  })

  it('keeps an open slot as a start time only', () => {
    expect(
      calendarSpanLabel(
        span({ status: 'open', clientName: null, bookingId: null, durationMin: 30 }),
        '10:00',
        '10:30',
      ),
    ).toBe('10:00')
  })
})
