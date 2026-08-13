import {
  formatTimeInTimeZone,
  formatYmdDateInTimeZone,
} from '@/shared/lib/tz'

export function splitInstantLocal(instant: Date): { date: string; time: string } {
  return {
    date: formatYmdDateInTimeZone(instant),
    time: formatTimeInTimeZone(instant),
  }
}
