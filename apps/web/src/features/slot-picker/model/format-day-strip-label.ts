import {
  MASTER_TIMEZONE,
  zonedLocalToUtc,
} from '@/shared/lib/tz'

export function formatDayStripLabel(ymdDate: string): string {
  const instant = zonedLocalToUtc(ymdDate, 12 * 60, MASTER_TIMEZONE)

  return new Intl.DateTimeFormat('ru-BY', {
    timeZone: MASTER_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
  }).format(instant)
}
