import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  formatYmdDateInTimeZone,
  getLocalMinuteOfDay,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'

/** Inclusive start of quiet hours: 23:00 Europe/Minsk. */
export const QUIET_HOURS_START_MIN = 23 * 60

/** Exclusive end of quiet hours: 07:00 Europe/Minsk. */
export const QUIET_HOURS_END_MIN = 7 * 60

export function isQuietHours(
  instant: Date,
  timeZone: string = MASTER_TIMEZONE,
): boolean {
  const minute = getLocalMinuteOfDay(instant, timeZone)

  return minute >= QUIET_HOURS_START_MIN || minute < QUIET_HOURS_END_MIN
}

/**
 * If `instant` falls in 23:00–07:00 local time, move it to 07:00
 * (same morning, or next morning when the clock is after 23:00).
 */
export function deferQuietHours(
  instant: Date,
  timeZone: string = MASTER_TIMEZONE,
): Date {
  if (!isQuietHours(instant, timeZone)) {
    return instant
  }

  const ymd = formatYmdDateInTimeZone(instant, timeZone)
  const minute = getLocalMinuteOfDay(instant, timeZone)

  if (minute >= QUIET_HOURS_START_MIN) {
    return zonedLocalToUtc(
      addDaysToYmdDate(ymd, 1),
      QUIET_HOURS_END_MIN,
      timeZone,
    )
  }

  return zonedLocalToUtc(ymd, QUIET_HOURS_END_MIN, timeZone)
}
