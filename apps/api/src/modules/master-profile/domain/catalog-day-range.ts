import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'

export function catalogDayUtcRange(ymdDate: string): { start: Date; end: Date } {
  return {
    start: zonedLocalToUtc(ymdDate, 0, MASTER_TIMEZONE),
    end: zonedLocalToUtc(addDaysToYmdDate(ymdDate, 1), 0, MASTER_TIMEZONE),
  }
}
