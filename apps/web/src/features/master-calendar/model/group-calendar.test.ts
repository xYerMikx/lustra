import type { MasterCalendarView } from '@lumira/contracts'
import { describe, expect, it } from 'vitest'

import { calendarSlotLabel } from '@/features/master-calendar/model/calendar-slot-label'
import { groupCalendarByDay } from '@/features/master-calendar/model/group-calendar'

function slot(
  overrides: Partial<MasterCalendarView['slots'][number]> & { id: string },
): MasterCalendarView['slots'][number] {
  return {
    startsAt: '2026-08-11T07:00:00.000Z',
    endsAt: '2026-08-11T07:30:00.000Z',
    status: 'open',
    clientName: null,
    bookingId: null,
    isExtra: false,
    extraPayAmount: null,
    ...overrides,
  }
}

describe('groupCalendarByDay', () => {
  it('keeps open, held, booked, and blocked slots on the day', () => {
    const data: MasterCalendarView = {
      timezone: 'Europe/Minsk',
      granularityMin: 30,
      from: '2026-08-11',
      to: '2026-08-11',
      slots: [
        slot({
          id: 'open-1',
          startsAt: '2026-08-11T07:00:00.000Z',
          endsAt: '2026-08-11T07:30:00.000Z',
          status: 'open',
        }),
        slot({
          id: 'held-1',
          startsAt: '2026-08-11T07:30:00.000Z',
          endsAt: '2026-08-11T08:00:00.000Z',
          status: 'held',
          clientName: 'Оля',
        }),
        slot({
          id: 'booked-1',
          startsAt: '2026-08-11T08:00:00.000Z',
          endsAt: '2026-08-11T08:30:00.000Z',
          status: 'booked',
          clientName: 'Анна',
        }),
        slot({
          id: 'blocked-1',
          startsAt: '2026-08-11T10:00:00.000Z',
          endsAt: '2026-08-11T10:30:00.000Z',
          status: 'blocked',
        }),
        slot({
          id: 'other-day',
          startsAt: '2026-08-12T07:00:00.000Z',
          endsAt: '2026-08-12T07:30:00.000Z',
        }),
      ],
      blocks: [],
      exceptions: [],
    }

    const [day] = groupCalendarByDay(data, '2026-08-11', '2026-08-11')

    expect(day?.slots.map((item) => item.status)).toEqual([
      'open',
      'held',
      'booked',
      'blocked',
    ])
  })
})

describe('calendarSlotLabel', () => {
  it('shows client name on booked slots and status on hold/block', () => {
    expect(
      calendarSlotLabel(
        slot({
          id: 'b',
          status: 'booked',
          clientName: 'Анна',
        }),
        '10:00',
      ),
    ).toBe('10:00 · Анна')

    expect(
      calendarSlotLabel(slot({ id: 'h', status: 'held', clientName: 'Оля' }), '10:30'),
    ).toBe('10:30 · холд')

    expect(
      calendarSlotLabel(slot({ id: 'x', status: 'blocked' }), '13:00'),
    ).toBe('13:00 · блок')
  })
})
