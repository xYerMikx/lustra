import { dateLabel } from '@/features/master-calendar/model/group-calendar'

export function calendarRangeLabel(from: string, to: string): string {
  if (from === to) {
    return dateLabel(from)
  }

  return `${dateLabel(from)} — ${dateLabel(to)}`
}
