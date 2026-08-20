import type { MasterCalendarSlotView } from '@lustra/contracts'

export type CalendarSpan = {
  id: string
  startsAt: string
  endsAt: string
  status: MasterCalendarSlotView['status']
  clientName: string | null
  bookingId: string | null
  durationMin: number
}

function minutesBetween(startsAt: string, endsAt: string): number {
  return Math.round(
    (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000,
  )
}

function canMerge(
  prev: CalendarSpan,
  slot: MasterCalendarSlotView,
): boolean {
  if (slot.status === 'open' || prev.status !== slot.status) {
    return false
  }

  if (prev.endsAt !== slot.startsAt) {
    return false
  }

  if (prev.bookingId && slot.bookingId) {
    return prev.bookingId === slot.bookingId
  }

  return prev.clientName != null && prev.clientName === slot.clientName
}

export function mergeSlotSpans(
  slots: MasterCalendarSlotView[],
): CalendarSpan[] {
  const sorted = [...slots].sort((left, right) =>
    left.startsAt.localeCompare(right.startsAt),
  )
  const spans: CalendarSpan[] = []

  for (const slot of sorted) {
    const prev = spans[spans.length - 1]

    if (prev && canMerge(prev, slot)) {
      prev.endsAt = slot.endsAt
      prev.durationMin = minutesBetween(prev.startsAt, prev.endsAt)

      continue
    }

    spans.push({
      id: slot.id,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      status: slot.status,
      clientName: slot.clientName,
      bookingId: slot.bookingId,
      durationMin: minutesBetween(slot.startsAt, slot.endsAt),
    })
  }

  return spans
}

export function spansForHour(
  spans: CalendarSpan[],
  hourStartIso: string,
  hourEndIso: string,
): CalendarSpan[] {
  return spans.filter((span) => {
    const startsAt = new Date(span.startsAt)

    return startsAt >= new Date(hourStartIso) && startsAt < new Date(hourEndIso)
  })
}
