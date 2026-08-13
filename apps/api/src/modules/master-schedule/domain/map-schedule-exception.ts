import type { ScheduleExceptionView } from '@lustra/contracts'

import type { ScheduleExceptionRecord } from '@/modules/master-schedule/app/schedule-exception.ports'

export function ymdDateToUtcMidnight(ymdDate: string): Date {
  return new Date(`${ymdDate}T00:00:00.000Z`)
}

export function utcMidnightToYmdDate(instant: Date): string {
  return instant.toISOString().slice(0, 10)
}

export function toScheduleExceptionView(
  record: ScheduleExceptionRecord,
): ScheduleExceptionView {
  return {
    id: record.id,
    date: utcMidnightToYmdDate(record.date),
    type: record.type,
    startMin: record.startMin,
    endMin: record.endMin,
    note: record.note,
  }
}
