import type { CalendarSpan } from '@/features/master-calendar/model/merge-slot-spans'

export function calendarSpanLabel(
  span: CalendarSpan,
  startLabel: string,
  endLabel: string,
): string {
  if (span.status === 'booked' && span.clientName) {
    return `${startLabel}–${endLabel} · ${span.clientName} · ${span.durationMin} мин`
  }

  if (span.status === 'held') {
    return `${startLabel}–${endLabel} · холд · ${span.durationMin} мин`
  }

  if (span.status === 'blocked') {
    return `${startLabel}–${endLabel} · блок`
  }

  if (span.status === 'booked') {
    return `${startLabel}–${endLabel} · запись · ${span.durationMin} мин`
  }

  return startLabel
}

export function isOpenCalendarSpan(span: CalendarSpan): boolean {
  return span.status === 'open'
}
