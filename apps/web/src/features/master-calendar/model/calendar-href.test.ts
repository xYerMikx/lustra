import { describe, expect, it } from 'vitest'

import {
  bookingHrefFromCalendar,
  calendarHref,
  safeReturnPath,
} from '@/features/master-calendar/model/calendar-href'

describe('calendar href', () => {
  it('keeps view and date in the calendar url', () => {
    expect(calendarHref('day', '2026-08-20')).toBe(
      '/app/master/calendar?view=day&date=2026-08-20',
    )
  })

  it('encodes a calendar return path on the booking url', () => {
    expect(
      bookingHrefFromCalendar(
        'b1',
        '/app/master/calendar?view=day&date=2026-08-20',
      ),
    ).toContain('from=%2Fapp%2Fmaster%2Fcalendar')
  })

  it('rejects return paths outside the master cabinet', () => {
    expect(safeReturnPath('https://evil.example', '/app/master/bookings')).toBe(
      '/app/master/bookings',
    )
    expect(
      safeReturnPath(
        '/app/master/calendar?view=week&date=2026-08-20',
        '/app/master/bookings',
      ),
    ).toBe('/app/master/calendar?view=week&date=2026-08-20')
  })
})
