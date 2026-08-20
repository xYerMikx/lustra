const YMD = /^\d{4}-\d{2}-\d{2}$/

export function isYmdDate(value: string | null): value is string {
  return Boolean(value && YMD.test(value))
}

export function calendarHref(view: 'day' | 'week', date: string): string {
  const params = new URLSearchParams()
  params.set('view', view)
  params.set('date', date)

  return `/app/master/calendar?${params.toString()}`
}

export function bookingHrefFromCalendar(
  bookingId: string,
  calendarPath: string,
): string {
  const params = new URLSearchParams()
  params.set('from', calendarPath)

  return `/app/master/bookings/${bookingId}?${params.toString()}`
}

export function safeReturnPath(from: string | null, fallback: string): string {
  if (!from || !from.startsWith('/app/master/')) {
    return fallback
  }

  return from
}
