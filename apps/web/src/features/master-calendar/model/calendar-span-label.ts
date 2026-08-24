import type { CalendarSpan } from '@/features/master-calendar/model/merge-slot-spans'
import { extraPaySuffix } from '@/shared/lib/money'

export function calendarSpanLabel(
  span: CalendarSpan,
  startLabel: string,
  endLabel: string,
): string {
  const extra = extraPaySuffix(span.extraPayAmount)

  if (span.status === 'closed') {
    return `${startLabel} · скрыт`
  }

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

  return `${startLabel}${extra}`
}

export function isOpenCalendarSpan(span: CalendarSpan): boolean {
  return span.status === 'open'
}
