import { minuteOfDayFromHm } from '@/features/master-calendar/model/minute-of-day-from-hm'
import { zonedLocalToUtc } from '@/shared/lib/tz'

export function buildManualStartsAt(
  date: string,
  startTime: string,
): string | null {
  const minutes = minuteOfDayFromHm(startTime)

  if (minutes == null) {
    return null
  }

  return zonedLocalToUtc(date, minutes).toISOString()
}
