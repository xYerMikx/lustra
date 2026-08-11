export const MASTER_TIMEZONE = 'Europe/Minsk'

const WEEKDAY_TO_ISO: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * Offset of `timeZone` relative to UTC at `instant`, in milliseconds.
 * Positive means the zone is ahead of UTC (e.g. Europe/Minsk ≈ +3h).
 */
export function getTimeZoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)

  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((item) => item.type === type)

    return Number(part?.value ?? NaN)
  }

  const asUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour') === 24 ? 0 : read('hour'),
    read('minute'),
    read('second'),
  )

  return asUtc - instant.getTime()
}

/** Local calendar date `YYYY-MM-DD` in `timeZone` for a UTC instant. */
export function formatYmdInTimeZone(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant)
}

/** Convert local wall-clock (`ymd` + minutes-of-day) in `timeZone` to a UTC Date. */
export function zonedLocalToUtc(
  ymd: string,
  minuteOfDay: number,
  timeZone: string,
): Date {
  const hours = Math.floor(minuteOfDay / 60)
  const minutes = minuteOfDay % 60
  const guess = new Date(`${ymd}T${pad2(hours)}:${pad2(minutes)}:00.000Z`)
  const offsetMs = getTimeZoneOffsetMs(guess, timeZone)

  return new Date(guess.getTime() - offsetMs)
}

export function addDaysYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const utc = new Date(Date.UTC(year!, month! - 1, day! + days))

  return `${utc.getUTCFullYear()}-${pad2(utc.getUTCMonth() + 1)}-${pad2(utc.getUTCDate())}`
}

export function compareYmd(a: string, b: string): number {
  if (a < b) {
    return -1
  }

  if (a > b) {
    return 1
  }

  return 0
}

export function maxYmd(a: string, b: string): string {
  return compareYmd(a, b) >= 0 ? a : b
}

export function minYmd(a: string, b: string): string {
  return compareYmd(a, b) <= 0 ? a : b
}

export function eachYmd(fromYmd: string, toYmd: string): string[] {
  const days: string[] = []
  let cursor = fromYmd

  while (compareYmd(cursor, toYmd) <= 0) {
    days.push(cursor)
    cursor = addDaysYmd(cursor, 1)
  }

  return days
}

/** ISO weekday 1=Mon … 7=Sun for a local calendar date in `timeZone`. */
export function isoWeekdayForYmd(ymd: string, timeZone: string): number {
  const noonUtc = zonedLocalToUtc(ymd, 12 * 60, timeZone)
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(noonUtc)
  const iso = WEEKDAY_TO_ISO[weekday]

  if (!iso) {
    throw new Error(`Unexpected weekday label: ${weekday}`)
  }

  return iso
}
